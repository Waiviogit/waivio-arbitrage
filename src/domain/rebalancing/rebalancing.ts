import { Inject, Injectable } from '@nestjs/common';
import {
  CalcHoldingsInterface,
  CalcOpenMarketInterface,
  GetDirectPoolMarketInterface,
  GetIndirectPoolMarketInterface,
  RebalancingInterface,
} from './interface';
import { HIVE_ENGINE_PROVIDE } from '../../services/hive-engine-api/constants';
import { HiveEngineClientInterface } from '../../services/hive-engine-api/interface';
import {
  ENGINE_TOKENS_FOR_PRECISION,
  ENGINE_TOKENS_SUPPORTED,
  REBALANCE_PAIRS_BTC,
  REBALANCE_PAIRS_ETH,
  REBALANCE_PAIRS_HIVE,
  REBALANCE_PAIRS_WAIV,
  REBALANCING_POOLS,
} from './constants';
import * as _ from 'lodash';
import { EngineBalanceType } from '../../services/hive-engine-api/types';
import { DirectPoolMarket, HoldingsType, OpenMarketType } from './types';
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
    const rebalancePairs = [
      ...REBALANCE_PAIRS_WAIV,
      ...REBALANCE_PAIRS_HIVE,
      ...REBALANCE_PAIRS_BTC,
      ...REBALANCE_PAIRS_ETH,
    ] as HoldingsType[];

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

  getDiffPercent(before: string, after: string): string {
    if (new BigNumber(before).eq(0)) return '0';
    return new BigNumber(after)
      .minus(before)
      .abs()
      .div(before)
      .times(100)
      .toFixed();
  }

  getDirectPoolMarket({
    pool,
    market,
  }: GetDirectPoolMarketInterface): DirectPoolMarket {
    const [base] = pool.tokenPair.split(':');
    const isSameBase = base === market.base;
    const marketRatio = isSameBase
      ? new BigNumber(pool.quoteQuantity).div(pool.baseQuantity).toFixed()
      : new BigNumber(pool.baseQuantity).div(pool.quoteQuantity).toFixed();

    return {
      marketRatio,
      difference: this.getDiffPercent(market.holdingsRatio, marketRatio),
    };
  }

  getIndirectPoolMarket({
    market,
    quotePool,
    basePool,
  }: GetIndirectPoolMarketInterface): DirectPoolMarket {
    const [base] = basePool.tokenPair.split(':');
    const isSameBase = base === market.base;
    const marketRatioBase = isSameBase
      ? new BigNumber(basePool.quoteQuantity).div(basePool.baseQuantity)
      : new BigNumber(basePool.baseQuantity).div(basePool.quoteQuantity);

    const [baseQuote] = quotePool.tokenPair.split(':');
    const isSameQuote = baseQuote === market.quote;
    const marketRatioQuote = isSameQuote
      ? new BigNumber(quotePool.quoteQuantity).div(quotePool.baseQuantity)
      : new BigNumber(quotePool.baseQuantity).div(quotePool.quoteQuantity);

    const marketRatio = marketRatioBase.div(marketRatioQuote).toFixed();

    return {
      marketRatio,
      difference: this.getDiffPercent(market.holdingsRatio, marketRatio),
    };
  }

  calcOpenMarket({
    holdings,
    pools,
  }: CalcOpenMarketInterface): OpenMarketType[] {
    const openMarkets = [...holdings] as OpenMarketType[];
    for (const element of openMarkets) {
      if (element.directPool) {
        const pool = pools.find((p) => p.tokenPair === element.pool);
        const { difference, marketRatio } = this.getDirectPoolMarket({
          pool,
          market: element,
        });
        element.difference = difference;
        element.marketRatio = marketRatio;
      } else {
        const basePool = pools.find((p) => p.tokenPair === element.basePool);
        const quotePool = pools.find((p) => p.tokenPair === element.quotePool);
        const { difference, marketRatio } = this.getIndirectPoolMarket({
          basePool,
          quotePool,
          market: element,
        });
        element.difference = difference;
        element.marketRatio = marketRatio;
      }
    }

    return openMarkets;
  }

  async getUserRebalanceTable(account: string): Promise<void> {
    const balances = await this.getNoZeroBalance(account);
    const holdings = this.calcHoldings({ balances });
    // const tokens = await this.hiveEngineClient.getTokens({
    //   symbol: { $in: ENGINE_TOKENS_FOR_PRECISION },
    // });
    const pools = await this.hiveEngineClient.getMarketPools({
      tokenPair: { $in: REBALANCING_POOLS },
    });

    const openMarket = this.calcOpenMarket({ holdings, pools });

  }
}
