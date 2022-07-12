import { Inject, Injectable } from '@nestjs/common';
import { ENGINE_CONTRACT } from '../../services/hive-engine-api/constants';
import { IEngineParser } from './interfaces/engine-parser.interface';
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

@Injectable()
export class EngineParser implements IEngineParser {
  constructor(
    @Inject(REBALANCING_PROVIDE.MAIN)
    private readonly _rebalancingDomain: RebalancingInterface,
    @Inject(USER_REBALANCING_PROVIDE.REPOSITORY)
    private readonly _userRebalancingRepository: UserRebalancingRepositoryInterface,
    private readonly _notificationSocketClient: NotificationSocketClient,
  ) {}

  async parseEngineBlock(transactions: EngineTransactionType[]): Promise<void> {
    // TODO пока стоит дев, заменить на production!
    if (process.env.NODE_ENV !== 'development') return;

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
    if (dataForNotifications) {
      // await this._notificationSocketClient.sendMessage(dataForNotifications);
      await this._notificationSocketClient.sendMessage([
        {
          account: 'jessihollander',
          differencePercent: '7',
          tokenPair: 'bla',
        },
      ]);
    }
  }

  /** --------------------------PRIVATE METHODS----------------------------------------*/

  private _handleSwapEvents(marketPool): Set<string> {
    const pools = [];

    for (const marketPoolElement of marketPool) {
      const payload = parseJson(marketPoolElement.payload);
      const logs = parseJson(marketPoolElement.logs);
      if (!Object.keys(logs).length || logs.errors) continue;

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
    const users = await this._userRebalancingRepository.find({
      filter: { differencePercent: { $gt: 0 } },
    });

    return users.filter((user) =>
      tokenPairs.some(
        (pair) => Object.keys(user.toObject()).includes(pair) && user[pair],
      ),
    );
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
          ...this._prepareNotificationData(pools, user.account),
        );
      }
    }

    return dataForNotifications;
  }

  private _prepareNotificationData(
    pools: OpenMarketType[],
    account: string,
  ): NotificationDataType[] {
    const dataForNotifications = [];
    for (const pool of pools) {
      dataForNotifications.push({
        account,
        differencePercent: pool.difference,
        tokenPair: pool.dbField,
      });
    }

    return dataForNotifications;
  }
}
