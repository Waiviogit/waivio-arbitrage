import { Inject, Injectable } from '@nestjs/common';
import {
  AddActiveStatusOnPairsInterface,
  CalcHoldingsInterface,
  CalcOpenMarketInterface,
  CalcRatioInterface,
  ChangeNotificationSettingsInterface,
  GetDirectPoolMarketInterface,
  GetIndirectPoolMarketInterface,
  RebalancingInterface,
} from './interface';
import { HIVE_ENGINE_PROVIDE } from '../../services/hive-engine-api/constants';
import {
  HiveEngineClientInterface,
  SwapHelperInterface,
} from '../../services/hive-engine-api/interface';
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
import {
  DirectPoolMarket,
  HoldingsType,
  OpenMarketType,
  RebalanceTableRowType,
  UserRebalanceTableType,
} from './types';
import BigNumber from 'bignumber.js';
import { USER_REBALANCING_PROVIDE } from '../../persistence/user-rebalancing/constants';
import { UserRebalancingRepositoryInterface } from '../../persistence/user-rebalancing/interface';
import { UserRebalancingDocumentType } from '../../persistence/user-rebalancing/types';

@Injectable()
export class Rebalancing implements RebalancingInterface {
  constructor(
    @Inject(HIVE_ENGINE_PROVIDE.CLIENT)
    private readonly hiveEngineClient: HiveEngineClientInterface,
    @Inject(HIVE_ENGINE_PROVIDE.SWAP_HELPER)
    private readonly swapHelper: SwapHelperInterface,
    @Inject(USER_REBALANCING_PROVIDE.REPOSITORY)
    private readonly userRebalancingRepository: UserRebalancingRepositoryInterface,
  ) {}

  async getNoZeroBalance(account: string): Promise<EngineBalanceType[]> {
    const balances = await this.hiveEngineClient.getTokenBalances({
      account,
      symbol: { $in: Object.values(ENGINE_TOKENS_SUPPORTED) },
    });
    return _.filter(balances, (token) => parseFloat(token.balance) > 0);
  }

  calcHoldings({
    balances,
    initialValues,
  }: CalcHoldingsInterface): HoldingsType[] {
    for (const rebalancePair of initialValues) {
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
    return initialValues;
  }

  calcRatio({ pool, market, key }: CalcRatioInterface): string {
    const [base] = pool.tokenPair.split(':');
    const isSameBase = base === market[key];
    return isSameBase
      ? new BigNumber(pool.quoteQuantity).div(pool.baseQuantity).toFixed()
      : new BigNumber(pool.baseQuantity).div(pool.quoteQuantity).toFixed();
  }

  getDiffPercent(before: string, after: string): string {
    if (new BigNumber(before).eq(0)) return '0';
    return new BigNumber(after).minus(before).div(before).times(100).toFixed();
  }

  getDirectPoolMarket({
    pool,
    market,
  }: GetDirectPoolMarketInterface): DirectPoolMarket {
    const marketRatio = this.calcRatio({ pool, market, key: 'base' });

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
    const marketRatioBase = this.calcRatio({
      pool: basePool,
      market,
      key: 'base',
    });

    const marketRatioQuote = this.calcRatio({
      pool: quotePool,
      market,
      key: 'quote',
    });

    const marketRatio = new BigNumber(marketRatioBase)
      .div(marketRatioQuote)
      .toFixed();

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

  addActiveStatusOnPairs({
    user,
    holdings,
  }: AddActiveStatusOnPairsInterface): HoldingsType[] {
    for (const holding of holdings) {
      holding.active = user[holding.dbField];
    }
    return holdings;
  }

  async getUserRebalanceTable(
    account: string,
  ): Promise<UserRebalanceTableType> {
    const user = await this.userRebalancingRepository.findOneOrCreate(account);
    const initialValues = [
      ...REBALANCE_PAIRS_WAIV,
      ...REBALANCE_PAIRS_HIVE,
      ...REBALANCE_PAIRS_BTC,
      ...REBALANCE_PAIRS_ETH,
    ] as HoldingsType[];
    const balances = await this.getNoZeroBalance(account);
    const holdings = this.calcHoldings({ balances, initialValues });
    const holdingsWithStatus = this.addActiveStatusOnPairs({ user, holdings });

    const pools = await this.hiveEngineClient.getMarketPools({
      tokenPair: { $in: REBALANCING_POOLS },
    });

    const openMarket = this.calcOpenMarket({
      holdings: holdingsWithStatus,
      pools,
    });

    for (const openMarketElement of openMarket as RebalanceTableRowType[]) {
      if (openMarketElement.directPool === true) {
        const toSwap = new BigNumber(openMarketElement.difference).lt(0)
          ? 'quote'
          : 'base';

        const percentToSwap = new BigNumber(openMarketElement.difference)
          .div(2)
          .div(100)
          .abs()
          .toFixed();

        const quantityToSwap = new BigNumber(
          openMarketElement[`${toSwap}Quantity`],
        )
          .times(percentToSwap)
          .toFixed();

        const pool = pools.find((p) => p.tokenPair === openMarketElement.pool);
        const swapOutput = this.swapHelper.getSwapOutput({
          symbol: openMarketElement[toSwap],
          amountIn: quantityToSwap,
          slippage: 0.005,
          precision: '8',
          tradeFeeMul: 0.9975,
          pool,
        });

        const newBaseQuantity =
          toSwap === 'quote'
            ? new BigNumber(swapOutput.amountOut)
                .plus(openMarketElement.baseQuantity)
                .toFixed()
            : new BigNumber(openMarketElement.baseQuantity)
                .minus(quantityToSwap)
                .toFixed();

        const newQuoteQuantity =
          toSwap === 'quote'
            ? new BigNumber(openMarketElement.quoteQuantity)
                .minus(quantityToSwap)
                .toFixed()
            : new BigNumber(openMarketElement.quoteQuantity)
                .plus(swapOutput.amountOut)
                .toFixed();

        const ratio = new BigNumber(newQuoteQuantity)
          .div(newBaseQuantity)
          .toFixed();

        const earn = this.getDiffPercent(
          new BigNumber(openMarketElement.baseQuantity)
            .times(openMarketElement.quoteQuantity)
            .toFixed(),
          new BigNumber(newBaseQuantity).times(newQuoteQuantity).toFixed(),
        );
        const rebalanceBase =
          toSwap === 'quote'
            ? `+ ${swapOutput.amountOut} ${openMarketElement.base}`
            : `- ${quantityToSwap} ${openMarketElement.base}`;

        const rebalanceQuote =
          toSwap === 'quote'
            ? `- ${quantityToSwap} ${openMarketElement.quote}`
            : `+ ${swapOutput.amountOut} ${openMarketElement.quote}`;

        openMarketElement.earn = earn;
        openMarketElement.rebalanceBase = rebalanceBase;
        openMarketElement.rebalanceQuote = rebalanceQuote;
      } else {
        openMarketElement.earn = '0';
        openMarketElement.rebalanceBase = '0';
        openMarketElement.rebalanceQuote = '0';
      }
    }

    return {
      differencePercent: user.differencePercent,
      table: openMarket as RebalanceTableRowType[],
    };
  }

  async changeNotificationSettings({
    account,
    update,
  }: ChangeNotificationSettingsInterface): Promise<UserRebalancingDocumentType> {
    return this.userRebalancingRepository.findOneAndUpdate({
      filter: { account },
      update,
    });
  }
}
