import { Inject, Injectable } from '@nestjs/common';
import { CalcHoldingsInterface, RebalancingInterface } from './interface';
import { HIVE_ENGINE_PROVIDE } from '../../services/hive-engine-api/constants';
import { HiveEngineClientInterface } from '../../services/hive-engine-api/interface';
import {
  ENGINE_TOKENS_FOR_PRECISION,
  ENGINE_TOKENS_SUPPORTED,
  REBALANCE_PAIRS_BTC,
  REBALANCE_PAIRS_ETH,
  REBALANCE_PAIRS_HIVE,
  REBALANCE_PAIRS_WAIV,
} from './constants';
import * as _ from 'lodash';
import { EngineBalanceType } from '../../services/hive-engine-api/types';
import { HoldingsType } from './types';
import BigNumber from 'bignumber.js';

@Injectable()
export class Rebalancing implements RebalancingInterface {
  constructor(
    @Inject(HIVE_ENGINE_PROVIDE.CLIENT)
    private readonly hiveEngineClient: HiveEngineClientInterface,
  ) {}

  async getNoZeroBalance(account: string): Promise<EngineBalanceType[]> {
    const balances = await this.hiveEngineClient.getTokenBalances({
      account,
      symbol: { $in: Object.values(ENGINE_TOKENS_SUPPORTED) },
    });
    return _.filter(balances, (token) => parseFloat(token.balance) > 0);
  }

  calcHoldings({ balances }: CalcHoldingsInterface): HoldingsType[] {
    const rebalancePairs = [];
    rebalancePairs.push(
      ...REBALANCE_PAIRS_WAIV,
      ...REBALANCE_PAIRS_HIVE,
      ...REBALANCE_PAIRS_BTC,
      ...REBALANCE_PAIRS_ETH,
    );

    for (const rebalancePair of rebalancePairs) {
      const baseBalance = balances.find((b) => b.symbol === rebalancePair.base);
      const quoteBalance = balances.find(
        (b) => b.symbol === rebalancePair.quote,
      );
      if (baseBalance && quoteBalance) {
        rebalancePair.baseQuantity = baseBalance.balance;
        rebalancePair.quoteQuantity = quoteBalance.balance;
        rebalancePair.holdingsRatio = new BigNumber(quoteBalance.balance)
          .div(baseBalance.balance)
          .toFixed();
      } else {
        rebalancePair.baseQuantity = '0';
        rebalancePair.quoteQuantity = '0';
        rebalancePair.holdingsRatio = '0';
      }
    }
    return rebalancePairs;
  }

  async getUserRebalanceTable(account: string): Promise<void> {
    const balances = await this.getNoZeroBalance(account);
    const tokens = await this.hiveEngineClient.getTokens({
      symbol: { $in: ENGINE_TOKENS_FOR_PRECISION },
    });
    const holdings = this.calcHoldings({ balances });

  }
}
