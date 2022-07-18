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
import { USER_REBALANCING_PROVIDE } from '../../persistence/user-rebalancing/constants';
import { UserRebalancingRepositoryInterface } from '../../persistence/user-rebalancing/interface';
import { UserRebalancingDocumentType } from '../../persistence/user-rebalancing/types';
import BigNumber from 'bignumber.js';
import { OpenMarketType } from '../../domain/rebalancing/types';
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

@Injectable()
export class EngineParser implements EngineParserInterface {
  constructor(
    @Inject(REBALANCING_PROVIDE.MAIN)
    private readonly _rebalancingDomain: RebalancingInterface,
    @Inject(USER_REBALANCING_PROVIDE.REPOSITORY)
    private readonly _userRebalancingRepository: UserRebalancingRepositoryInterface,
    private readonly _notificationSocketClient: NotificationSocketClient,
    @Inject(REDIS_PROVIDERS.NOTIFICATION)
    private readonly _redisNotificationClient: RedisNotificationsInterface,
  ) {}

  async parseEngineBlock(transactions: EngineTransactionType[]): Promise<void> {
    const marketPool = transactions.filter(
      (transaction) =>
        transaction.contract === ENGINE_CONTRACT.MARKETPOOLS.NAME,
    );
    if (!marketPool.length) return;

    const poolTokens = this._handleSwapEvents(marketPool);
    if (!poolTokens.size) return;

    const dbRebalancingPairs = this._getDbPoolPairs(poolTokens);
    const users = await this._getUsersToCheck(dbRebalancingPairs);
    const dataForNotifications = await this._checkUsersDifferences(users);
    if (dataForNotifications.length) {
      const message = JSON.stringify({
        method: METHODS.setNotification,
        payload: {
          id: NOTIFICATION_TYPES.arbitrage,
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
    return await this._userRebalancingRepository.find({
      filter: { $or: tokenPairs.map((pair) => ({ [pair]: true })) },
    });
  }

  private async _checkUsersDifferences(
    users: UserRebalancingDocumentType[],
  ): Promise<NotificationDataType[]> {
    const dataForNotifications = [];
    for (const user of users) {
      const userAndMarketInfo =
        await this._rebalancingDomain.getUserRebalanceTable(user.account);
      const pools = userAndMarketInfo.table.filter((pool) =>
        Object.keys(user.toObject()).some(
          (pair) =>
            pool.active &&
            pool.dbField.includes(pair) &&
            new BigNumber(pool.difference).abs().gte(user.differencePercent),
        ),
      );
      if (pools.length) {
        dataForNotifications.push(
          ...(await this._prepareNotificationData(pools, user.account)),
        );
      }
    }

    return dataForNotifications;
  }

  private async _prepareNotificationData(
    pools: OpenMarketType[],
    account: string,
  ): Promise<NotificationDataType[]> {
    const dataForNotifications = [];
    for (const pool of pools) {
      const recentNotification = await this._checkIfNotificationSentRecently(
        pool,
        account,
      );
      if (recentNotification) continue;

      const differencePercent = new BigNumber(pool.difference).toFixed(2);
      dataForNotifications.push({
        account,
        differencePercent: differencePercent.replace('-', ''),
        tokenPair: pool.dbField,
      });
      await this._redisNotificationClient.zadd({
        key: `rebalancing:${account}`,
        score: moment.utc().unix(),
        value: `${pool.dbField}:${differencePercent}`,
      });
    }

    return dataForNotifications;
  }

  private async _checkIfNotificationSentRecently(
    pool: OpenMarketType,
    account: string,
  ): Promise<boolean> {
    /** clear sorted set from members older than a day */
    await this._redisNotificationClient.zremrangebyscore({
      key: `rebalancing:${account}`,
      min: 1,
      max: moment.utc().subtract(1, 'day').unix(),
    });
    /** checking if notification was sent to this account within 10 minutes */
    const recentNotifications =
      await this._redisNotificationClient.zrangebyscore({
        key: `rebalancing:${account}`,
        min: moment.utc().subtract(10, 'minutes').unix(),
        max: moment.utc().unix(),
      });
    if (recentNotifications.length) {
      const samePair = recentNotifications.find((el) =>
        el.includes(pool.dbField));
      if (samePair) return true;
    }

    /** getting notifications older than 10 minutes */
    const accountNotifications =
      await this._redisNotificationClient.zrangebyscore({
        key: `rebalancing:${account}`,
        min: 1,
        max: moment.utc().subtract(10, 'minutes').unix(),
      });
    if (!accountNotifications.length) return false;

    const stepChange = this._checkDifferencePercentStepChange(
      accountNotifications,
      pool,
    );
    if (stepChange) return false;

    return true;
  }

  private _checkDifferencePercentStepChange(
    notifications: string[],
    pool: OpenMarketType,
  ): boolean {
    const notification = notifications.find((el) => el.includes(pool.dbField));
    if (!notification) return true;

    const differencePercent = notification.split(':')[1];
    const stepChange = new BigNumber(pool.difference)
      .dividedBy(differencePercent)
      .minus(1);
    if (stepChange.gte(0.2)) return true;

    return false;
  }
}
