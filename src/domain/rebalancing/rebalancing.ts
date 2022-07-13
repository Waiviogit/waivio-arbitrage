import { Inject, Injectable } from '@nestjs/common';
import {
  AddActiveStatusOnPairsInterface,
  CalcHoldingsInterface,
  CalcOpenMarketInterface,
  CalcRatioInterface,
  ChangeNotificationSettingsInterface,
  GetDirectPoolMarketInterface,
  GetEarnRebalanceInterface,
  GetIndirectPoolMarketInterface,
  GetPairRatioBalanceInterface,
  GetPoolMarketInterface,
  GetRebalanceSwapOutputInterface,
  GetRebalanceTableRowsInterface,
  GetUserSwapParamsInterface,
  RebalancingInterface,
} from './interface';
import { HIVE_ENGINE_PROVIDE } from '../../services/hive-engine-api/constants';
import {
  HiveEngineClientInterface,
  SwapHelperInterface,
} from '../../services/hive-engine-api/interface';
import {
  DEFAULT_PRECISION,
  DEFAULT_SLIPPAGE,
  DEFAULT_TRADE_FEE_MUL,
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
  EarnRebalanceType,
  HoldingsType,
  OpenMarketType,
  PairRatioBalanceType,
  PoolMarket,
  RebalanceTableRowType,
  SwapRebalanceOutputType,
  UserRebalanceTableType,
  UserSwapParamsType,
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

  getPairRatioBalance({
    balances,
    holding,
  }: GetPairRatioBalanceInterface): PairRatioBalanceType {
    const baseBalance = balances.find((b) => b.symbol === holding.base);
    const quoteBalance = balances.find((b) => b.symbol === holding.quote);
    if (!baseBalance || !quoteBalance) {
      return {
        baseQuantity: '0',
        quoteQuantity: '0',
        holdingsRatio: '0',
      };
    }
    return {
      baseQuantity: baseBalance.balance,
      quoteQuantity: quoteBalance.balance,
      holdingsRatio: new BigNumber(quoteBalance.balance)
        .div(baseBalance.balance)
        .toFixed(),
    };
  }

  calcHoldings({
    balances,
    initialValues,
  }: CalcHoldingsInterface): HoldingsType[] {
    for (const rebalancePair of initialValues) {
      const { baseQuantity, quoteQuantity, holdingsRatio } =
        this.getPairRatioBalance({ holding: rebalancePair, balances });

      rebalancePair.baseQuantity = baseQuantity;
      rebalancePair.quoteQuantity = quoteQuantity;
      rebalancePair.holdingsRatio = holdingsRatio;
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

  getPoolMarket({ market, pools }: GetPoolMarketInterface): PoolMarket {
    if (market.directPool) {
      const pool = pools.find((p) => p.tokenPair === market.pool);
      return this.getDirectPoolMarket({
        pool,
        market,
      });
    }
    const basePool = pools.find((p) => p.tokenPair === market.basePool);
    const quotePool = pools.find((p) => p.tokenPair === market.quotePool);
    return this.getIndirectPoolMarket({
      basePool,
      quotePool,
      market,
    });
  }

  getDirectPoolMarket({
    pool,
    market,
  }: GetDirectPoolMarketInterface): PoolMarket {
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
  }: GetIndirectPoolMarketInterface): PoolMarket {
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
    for (const market of openMarkets) {
      const { difference, marketRatio } = this.getPoolMarket({
        market,
        pools,
      });
      market.difference = difference;
      market.marketRatio = marketRatio;
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

  getRebalanceSwapOutput({
    row,
    pools,
    toSwap,
    quantityToSwap,
    slippage = DEFAULT_SLIPPAGE,
  }: GetRebalanceSwapOutputInterface): SwapRebalanceOutputType {
    if (row.directPool) {
      const pool = pools.find((p) => p.tokenPair === row.pool);
      return this.swapHelper.getSwapOutput({
        symbol: row[toSwap],
        amountIn: quantityToSwap,
        slippage,
        precision: DEFAULT_PRECISION,
        tradeFeeMul: DEFAULT_TRADE_FEE_MUL,
        pool,
      });
    }
    const firstPoolKey = toSwap === 'base' ? 'basePool' : 'quotePool';
    const secondPoolKey = toSwap === 'base' ? 'quotePool' : 'basePool';
    const firstPool = pools.find((p) => p.tokenPair === row[firstPoolKey]);
    const secondPool = pools.find((p) => p.tokenPair === row[secondPoolKey]);
    const firstSwap = this.swapHelper.getSwapOutput({
      symbol: row[toSwap],
      amountIn: quantityToSwap,
      slippage,
      precision: DEFAULT_PRECISION,
      tradeFeeMul: DEFAULT_TRADE_FEE_MUL,
      pool: firstPool,
    });

    const secondSwap = this.swapHelper.getSwapOutput({
      symbol: ENGINE_TOKENS_SUPPORTED.SWAP_HIVE,
      amountIn: firstSwap.minAmountOut,
      slippage,
      precision: DEFAULT_PRECISION,
      tradeFeeMul: DEFAULT_TRADE_FEE_MUL,
      pool: secondPool,
    });
    const json = [firstSwap.json, secondSwap.json];

    return {
      ...secondSwap,
      json,
    };
  }

  getEarnRebalance({
    row,
    pools,
    slippage,
  }: GetEarnRebalanceInterface): EarnRebalanceType {
    if (new BigNumber(row.holdingsRatio).eq(0)) {
      return {
        earn: '0',
        rebalanceBase: '0',
        rebalanceQuote: '0',
      };
    }

    const toSwap = new BigNumber(row.difference).lt(0) ? 'quote' : 'base';

    const percentToSwap = new BigNumber(row.difference)
      .div(2)
      .div(100)
      .abs()
      .toFixed();

    const quantityToSwap = new BigNumber(row[`${toSwap}Quantity`])
      .times(percentToSwap)
      .toFixed(Number(DEFAULT_PRECISION));

    const swapOutput = this.getRebalanceSwapOutput({
      row,
      pools,
      toSwap,
      quantityToSwap,
      slippage,
    });

    const newBaseQuantity =
      toSwap === 'quote'
        ? new BigNumber(swapOutput.minAmountOut)
            .plus(row.baseQuantity)
            .toFixed()
        : new BigNumber(row.baseQuantity).minus(quantityToSwap).toFixed();

    const newQuoteQuantity =
      toSwap === 'quote'
        ? new BigNumber(row.quoteQuantity).minus(quantityToSwap).toFixed()
        : new BigNumber(row.quoteQuantity)
            .plus(swapOutput.minAmountOut)
            .toFixed();

    const ratio = new BigNumber(newQuoteQuantity)
      .div(newBaseQuantity)
      .toFixed();

    const earn = this.getDiffPercent(
      new BigNumber(row.baseQuantity).times(row.quoteQuantity).toFixed(),
      new BigNumber(newBaseQuantity).times(newQuoteQuantity).toFixed(),
    );
    const rebalanceBase =
      toSwap === 'quote'
        ? `+ ${swapOutput.minAmountOut} ${row.base}`
        : `- ${quantityToSwap} ${row.base}`;

    const rebalanceQuote =
      toSwap === 'quote'
        ? `- ${quantityToSwap} ${row.quote}`
        : `+ ${swapOutput.minAmountOut} ${row.quote}`;

    const from = {
      symbol: row[toSwap],
      quantity: quantityToSwap,
    };

    const to = {
      symbol: row[toSwap === 'base' ? 'quote' : 'base'],
      quantity: swapOutput.minAmountOut,
    };

    return {
      earn,
      rebalanceBase,
      rebalanceQuote,
      json: swapOutput.json,
      from,
      to,
    };
  }

  getRebalanceTableRows({
    openMarkets,
    pools,
  }: GetRebalanceTableRowsInterface): RebalanceTableRowType[] {
    for (const row of openMarkets as RebalanceTableRowType[]) {
      const { earn, rebalanceBase, rebalanceQuote } = this.getEarnRebalance({
        row,
        pools,
      });
      row.earn = earn;
      row.rebalanceBase = rebalanceBase;
      row.rebalanceQuote = rebalanceQuote;
    }

    return openMarkets as RebalanceTableRowType[];
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
    const pools = await this.hiveEngineClient.getMarketPools({
      tokenPair: { $in: REBALANCING_POOLS },
    });
    const holdings = this.calcHoldings({ balances, initialValues });
    const holdingsWithStatus = this.addActiveStatusOnPairs({ user, holdings });

    const openMarkets = this.calcOpenMarket({
      holdings: holdingsWithStatus,
      pools,
    });

    const tableRows = this.getRebalanceTableRows({ openMarkets, pools });

    return {
      differencePercent: user.differencePercent,
      table: tableRows,
    };
  }

  async getUserSwapParams({
    account,
    pair,
    slippage,
  }: GetUserSwapParamsInterface): Promise<UserSwapParamsType> {
    const initialValues = [
      ...REBALANCE_PAIRS_WAIV,
      ...REBALANCE_PAIRS_HIVE,
      ...REBALANCE_PAIRS_BTC,
      ...REBALANCE_PAIRS_ETH,
    ];
    const balances = await this.getNoZeroBalance(account);
    const pools = await this.hiveEngineClient.getMarketPools({
      tokenPair: { $in: REBALANCING_POOLS },
    });

    const rebalancePair = initialValues.find(
      (el) => el.dbField === pair,
    ) as RebalanceTableRowType;
    const walletRatio = this.getPairRatioBalance({
      holding: rebalancePair,
      balances,
    });
    Object.assign(rebalancePair, walletRatio);
    const marketRatio = this.getPoolMarket({
      market: rebalancePair,
      pools,
    });
    Object.assign(rebalancePair, marketRatio);
    const earnRebalance = this.getEarnRebalance({
      row: rebalancePair,
      pools,
      slippage,
    });
    if (!earnRebalance.json) {
      return { error: { status: 422, message: 'Marketpools error' } };
    }

    return {
      from: earnRebalance.from,
      to: earnRebalance.to,
      json: JSON.stringify(earnRebalance.json),
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