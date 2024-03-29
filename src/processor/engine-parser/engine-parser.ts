import { Inject, Injectable } from '@nestjs/common';
import { ENGINE_CONTRACT } from '../../services/hive-engine-api/constants';
import { EngineParserInterface } from './interfaces/engine-parser.interface';
import { EngineTransactionType } from '../../services/hive-engine-api/types';
import { parseJson } from '../../common/helpers/jsonHelper';
import {
  DB_REBALANCING_FIELD,
  REBALANCING_POOLS,
  REBALANCING_PROVIDE,
} from '../../domain/rebalancing/constants';
import { RebalancingInterface } from '../../domain/rebalancing/interface';
import { UserRebalancingDocumentType } from '../../persistence/user-rebalancing/types';
import BigNumber from 'bignumber.js';
import { NotificationSocketClient } from '../../services/notification-socket/notification-socket.client';
import { NotificationDataType } from '../../services/notification-socket/types/notification.types';
import * as _ from 'lodash';
import { REDIS_PROVIDERS } from '../../redis/constants/provider';
import { RedisNotificationsInterface } from '../../redis/interfaces/redis-client.interfaces';
import {
  METHODS,
  NOTIFICATION_TYPES,
} from '../../services/notification-socket/constants/notification-socket.constants';
import * as moment from 'moment';
import { SEND_UPDATE_MAX_TIME_MS } from './constants';
import { UserRebalancingRepositoryInterface } from '../../persistence/user-rebalancing/interface';
import { USER_REBALANCING_PROVIDE } from '../../persistence/user-rebalancing/constants';
import {
  CheckDifferencePercentChangeType,
  CheckNotificationSentRecentlyType,
  PrepareNotificationType,
} from './types/engine-parser.types';

@Injectable()
export class EngineParser implements EngineParserInterface {
  private previousSendDate;
  constructor(
    @Inject(REBALANCING_PROVIDE.MAIN)
    private readonly _rebalancingDomain: RebalancingInterface,
    @Inject(USER_REBALANCING_PROVIDE.REPOSITORY)
    private readonly _userRebalancingRepository: UserRebalancingRepositoryInterface,
    private readonly _notificationSocketClient: NotificationSocketClient,
    @Inject(REDIS_PROVIDERS.NOTIFICATION)
    private readonly _redisNotificationClient: RedisNotificationsInterface,
  ) {
    this.previousSendDate = new Date().valueOf();
  }

  async parseEngineBlock(transactions: EngineTransactionType[]): Promise<void> {
    const marketPool = transactions.filter(
      (transaction) =>
        transaction.contract === ENGINE_CONTRACT.MARKETPOOLS.NAME &&
        ENGINE_CONTRACT.MARKETPOOLS.ACTION,
    );
    if (!marketPool.length) return;

    await this._sendMessageToUpdateTableInfo();
    const poolTokens = this._handleSwapEvents(marketPool);
    if (!poolTokens.size) return;

    const dbRebalancingPairs = this._getDbPoolPairs(poolTokens);
    const users = await this._getUsersToCheck(dbRebalancingPairs);
    const dataForNotifications = await this._checkUsersDifferences(users);
    if (dataForNotifications.length) {
      const message = JSON.stringify({
        method: METHODS.SET_NOTIFICATION,
        payload: {
          id: NOTIFICATION_TYPES.ARBITRAGE,
          data: dataForNotifications,
        },
      });
      await this._notificationSocketClient.sendMessage(message);
    }
  }

  /** --------------------------PRIVATE METHODS----------------------------------------*/

  private _handleSwapEvents(marketPool): Set<string> {
    const pools = [];

    for (const marketPoolElement of marketPool) {
      const payload = parseJson(marketPoolElement.payload);
      const logs = parseJson(marketPoolElement.logs);
      if (_.isEmpty(logs) || logs.errors) continue;

      const imbalancedPool = REBALANCING_POOLS.find((pool) =>
        pool.includes(payload.tokenPair),
      );
      if (imbalancedPool) pools.push(imbalancedPool);
    }

    return new Set(...pools.map((pool) => pool.split(':')));
  }

  private _getDbPoolPairs(poolTokens: Set<string>): string[] {
    const dbRebalancingPairs = [];
    for (const el of poolTokens) {
      const token = el.includes('.') ? el.split('.')[1] : el;
      dbRebalancingPairs.push(
        ...Object.keys(DB_REBALANCING_FIELD).filter((pair) =>
          pair.includes(token),
        ),
      );
    }

    return dbRebalancingPairs;
  }

  private async _getUsersToCheck(
    tokenPairs: string[],
  ): Promise<UserRebalancingDocumentType[]> {
    return this._userRebalancingRepository.find({
      filter: { $or: tokenPairs.map((pair) => ({ [pair]: true })) },
    });
  }

  private async _checkUsersDifferences(
    users: UserRebalancingDocumentType[],
  ): Promise<NotificationDataType[]> {
    const dataForNotifications = [];
    if (_.isEmpty(users)) return dataForNotifications;

    for (const user of users) {
      const userAndMarketInfo =
        await this._rebalancingDomain.getUserRebalanceTable({
          account: user.account,
          showAll: true,
        });
      const pools = userAndMarketInfo.table.filter((pool) =>
        Object.keys(user).some(
          (pair) =>
            pool.active &&
            pool.dbField.includes(pair) &&
            new BigNumber(pool.difference).abs().gte(user.differencePercent) &&
            new BigNumber(user.differencePercent).toNumber() !== 0,
        ),
      );
      if (pools.length) {
        const notifications = await this._prepareNotificationData({
          pools,
          account: user.account,
          differencePercentSubscription: user.differencePercent,
        });
        dataForNotifications.push(...notifications);
      }
    }

    return dataForNotifications;
  }

  private async _prepareNotificationData({
    pools,
    account,
    differencePercentSubscription,
  }: PrepareNotificationType): Promise<NotificationDataType[]> {
    const dataForNotifications = [];

    for (const pool of pools) {
      const recentNotification = await this._checkIfNotificationSentRecently({
        pool,
        account,
        differencePercentSubscription,
      });
      if (recentNotification) continue;

      const differencePercent = new BigNumber(pool.difference).toFixed(2);
      dataForNotifications.push({
        account,
        differencePercent: differencePercent.replace('-', ''),
        tokenPair: pool.dbField.replace('_', ' / '),
      });
      await this._redisNotificationClient.zadd({
        key: `rebalancing:${account}`,
        score: moment.utc().unix(),
        value: `${pool.dbField}:${differencePercent}`,
      });
    }

    return dataForNotifications;
  }

  private async _checkIfNotificationSentRecently({
    pool,
    account,
    differencePercentSubscription,
  }: CheckNotificationSentRecentlyType): Promise<boolean> {
    /** clear sorted set from members older than a day */
    await this._redisNotificationClient.zremrangebyscore({
      key: `rebalancing:${account}`,
      min: 1,
      max: moment.utc().subtract(1, 'day').unix(),
    });
    /** checking if notification was sent to this account within 5 minutes */
    const recentNotifications =
      await this._redisNotificationClient.zrangebyscore({
        key: `rebalancing:${account}`,
        min: moment.utc().subtract(5, 'minutes').unix(),
        max: moment.utc().unix(),
      });
    if (recentNotifications.length) {
      const samePair = recentNotifications.find((el) =>
        el.includes(pool.dbField),
      );
      if (samePair) return true;
    }

    /** getting notifications older than 5 minutes */
    const accountNotifications =
      await this._redisNotificationClient.zrangebyscore({
        key: `rebalancing:${account}`,
        min: 1,
        max: moment.utc().subtract(5, 'minutes').unix(),
      });
    if (!accountNotifications.length) return false;

    const percentStep = new BigNumber(differencePercentSubscription)
      .multipliedBy(0.2)
      .toFixed();
    const stepChange = this._checkDifferencePercentStepChange({
      notifications: accountNotifications,
      pool,
      percentStep,
    });
    if (stepChange) return false;

    return true;
  }

  private _checkDifferencePercentStepChange({
    notifications,
    pool,
    percentStep,
  }: CheckDifferencePercentChangeType): boolean {
    const savedNotifications = notifications.filter((el) =>
      el.includes(pool.dbField),
    );
    if (!savedNotifications.length) return true;

    const differencePercent =
      savedNotifications[savedNotifications.length - 1].split(':')[1];
    const stepChange = new BigNumber(pool.difference).minus(differencePercent);
    if (stepChange.gte(percentStep)) return true;

    return false;
  }

  private async _sendMessageToUpdateTableInfo(): Promise<void> {
    const now = new Date().valueOf();
    const diff = now - this.previousSendDate;
    if (diff < SEND_UPDATE_MAX_TIME_MS) return;
    const messageForUpdates = JSON.stringify({ method: METHODS.UPDATE_INFO });
    await this._notificationSocketClient.sendMessage(messageForUpdates);
    this.previousSendDate = new Date().valueOf();
  }
}
