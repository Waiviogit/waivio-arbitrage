import { Inject, Injectable } from '@nestjs/common';
import {
  AddActiveStatusOnPairsInterface,
  CalcHoldingsInterface,
  CalcOpenMarketInterface,
  CalcRatioInterface,
  ChangeNotificationSettingsInterface,
  GetDifferenceWithFeeInterface,
  GetDirectPoolMarketInterface,
  GetEarnRebalanceInterface,
  GetIndirectPoolMarketInterface,
  GetInitialValuesInterface,
  GetNewQuantityToSwapInterface,
  GetPairRatioBalanceInterface,
  GetPoolMarketInterface,
  getQuantityToSwapInterface,
  GetRebalanceSwapOutputInterface,
  GetRebalanceTableRowsInterface,
  GetUserRebalanceTableInterface,
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
  DEFAULT_SLIPPAGE_MAX,
  DEFAULT_TRADE_FEE_MUL,
  ENGINE_TOKENS_SUPPORTED,
  REBALANCE_PAIRS_BTC,
  REBALANCE_PAIRS_ETH,
  REBALANCE_PAIRS_HIVE,
  REBALANCE_PAIRS_WAIV,
  REBALANCING_POOLS,
} from './constants';
import * as _ from 'lodash';
import {
  BalancesBeforeSwapType,
  EngineBalanceType,
} from '../../services/hive-engine-api/types';
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
import { formatTwoNumbersAfterZero } from '../../common/helpers';
import { HOLDINGS_PERSISTENCE_PROVIDE } from '../../persistence/initial-holdings/constants';
import { InitialHoldingsRepositoryInterface } from '../../persistence/initial-holdings/interface';

@Injectable()
export class Rebalancing implements RebalancingInterface {
  constructor(
    @Inject(HIVE_ENGINE_PROVIDE.CLIENT)
    private readonly hiveEngineClient: HiveEngineClientInterface,
    @Inject(HIVE_ENGINE_PROVIDE.SWAP_HELPER)
    private readonly swapHelper: SwapHelperInterface,
    @Inject(USER_REBALANCING_PROVIDE.REPOSITORY)
    private readonly userRebalancingRepository: UserRebalancingRepositoryInterface,
    @Inject(HOLDINGS_PERSISTENCE_PROVIDE.REPOSITORY)
    private readonly initialHoldingsRepository: InitialHoldingsRepositoryInterface,
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
        baseQuantity: !baseBalance ? '0' : baseBalance.balance,
        quoteQuantity: !quoteBalance ? '0' : quoteBalance.balance,
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
      const swapOutput = this.swapHelper.getSwapOutput({
        symbol: row[toSwap],
        amountIn: quantityToSwap,
        slippage,
        precision: DEFAULT_PRECISION,
        tradeFeeMul: DEFAULT_TRADE_FEE_MUL,
        pool,
      });
      const updatedPoolRatio = new BigNumber(
        swapOutput.updatedPool.quoteQuantity,
      )
        .div(swapOutput.updatedPool.baseQuantity)
        .toFixed();
      const priceImpact = new BigNumber(
        this.getDiffPercent(pool.basePrice, swapOutput.updatedPool.basePrice),
      )
        .abs()
        .toFixed(2);

      return {
        ...swapOutput,
        updatedPoolRatio,
        priceImpact,
      };
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

    const firstImpact = new BigNumber(
      this.getDiffPercent(firstPool.basePrice, firstSwap.updatedPool.basePrice),
    ).abs();

    const secondSwap = this.swapHelper.getSwapOutput({
      symbol: ENGINE_TOKENS_SUPPORTED.SWAP_HIVE,
      amountIn: firstSwap.minAmountOut,
      slippage: DEFAULT_SLIPPAGE_MAX,
      precision: DEFAULT_PRECISION,
      tradeFeeMul: DEFAULT_TRADE_FEE_MUL,
      pool: secondPool,
    });
    const json = [firstSwap.json, secondSwap.json];

    const updatedPools = [firstSwap.updatedPool, secondSwap.updatedPool];
    const basePool = updatedPools.find((p) => p.tokenPair === row.basePool);
    const quotePool = updatedPools.find((p) => p.tokenPair === row.quotePool);

    const { marketRatio } = this.getIndirectPoolMarket({
      basePool,
      quotePool,
      market: row,
    });

    const secondImpact = new BigNumber(
      this.getDiffPercent(
        secondPool.basePrice,
        secondSwap.updatedPool.basePrice,
      ),
    ).abs();

    return {
      ...secondSwap,
      json,
      updatedPoolRatio: marketRatio,
      priceImpact: BigNumber.maximum(firstImpact, secondImpact).toFixed(2),
    };
  }

  getNewQuantityToSwap({
    toSwap,
    newPercent,
    quantityToSwap,
    percentRatioDiff,
  }: GetNewQuantityToSwapInterface): string {
    if (toSwap === 'quote') {
      return new BigNumber(percentRatioDiff).gt(0)
        ? new BigNumber(quantityToSwap)
            .minus(newPercent)
            .abs()
            .toFixed(DEFAULT_PRECISION)
        : new BigNumber(quantityToSwap)
            .plus(newPercent)
            .abs()
            .toFixed(DEFAULT_PRECISION);
    }

    return new BigNumber(percentRatioDiff).lt(0)
      ? new BigNumber(quantityToSwap)
          .minus(newPercent)
          .abs()
          .toFixed(DEFAULT_PRECISION)
      : new BigNumber(quantityToSwap)
          .plus(newPercent)
          .abs()
          .toFixed(DEFAULT_PRECISION);
  }

  getQuantityToSwap({
    difference,
    quantity,
  }: getQuantityToSwapInterface): string {
    if (new BigNumber(difference).lt(100)) {
      return new BigNumber(quantity)
        .times(new BigNumber(difference).div(100).abs())
        .div(2)
        .toFixed(DEFAULT_PRECISION);
      ///cool when little percent
    }
    const divider = new BigNumber(difference).abs().div(100).plus(1).toFixed();

    const reminder = new BigNumber(quantity).div(divider).toFixed();

    return new BigNumber(quantity).minus(reminder).toFixed(DEFAULT_PRECISION);
  }

  getDifferenceWithFee({
    difference,
    directPool,
  }: GetDifferenceWithFeeInterface): string {
    const feePercent = directPool ? '0.25' : '0.5';
    return new BigNumber(difference).lt(0) && new BigNumber(difference).gt(99)
      ? new BigNumber(difference).plus(feePercent).toFixed()
      : new BigNumber(difference).minus(feePercent).toFixed();
  }

  getEarnRebalance({
    row,
    pools,
    slippage,
  }: GetEarnRebalanceInterface): EarnRebalanceType {
    const zeroResp = {
      earn: '0',
      rebalanceBase: `0 ${row.base}`,
      rebalanceQuote: `0 ${row.quote}`,
    };

    if (new BigNumber(row.holdingsRatio).eq(0)) {
      return zeroResp;
    }

    if (new BigNumber(row.difference).abs().lt(0.25) && row.directPool) {
      return zeroResp;
    }

    if (new BigNumber(row.difference).abs().lt(0.5) && !row.directPool) {
      return zeroResp;
    }

    const toSwap = new BigNumber(row.difference).lt(0) ? 'quote' : 'base';

    let quantityToSwap = this.getQuantityToSwap({
      difference: row.difference,
      quantity: row[`${toSwap}Quantity`],
    });

    let isRatioDiff, swapOutput, newBaseQuantity, newQuoteQuantity;
    let previousDiff = '1000000000';
    let percentRatioDiff;

    do {
      swapOutput = this.getRebalanceSwapOutput({
        row,
        pools,
        toSwap,
        quantityToSwap,
        slippage,
      });

      newBaseQuantity =
        toSwap === 'quote'
          ? new BigNumber(swapOutput.amountOut).plus(row.baseQuantity).toFixed()
          : new BigNumber(row.baseQuantity).minus(quantityToSwap).toFixed();

      newQuoteQuantity =
        toSwap === 'quote'
          ? new BigNumber(row.quoteQuantity).minus(quantityToSwap).toFixed()
          : new BigNumber(row.quoteQuantity)
              .plus(swapOutput.amountOut)
              .toFixed();

      const walletRatio = new BigNumber(newQuoteQuantity)
        .div(newBaseQuantity)
        .toFixed(8, BigNumber.ROUND_HALF_UP);
      const updatedPoolRatio = new BigNumber(
        swapOutput.updatedPoolRatio,
      ).toFixed(8, BigNumber.ROUND_HALF_UP);

      percentRatioDiff = this.getDiffPercent(walletRatio, updatedPoolRatio);

      if (new BigNumber(percentRatioDiff).eq(previousDiff)) {
        break;
      }

      if (
        new BigNumber(percentRatioDiff)
          .abs()
          .lt(new BigNumber(previousDiff).abs())
      ) {
        previousDiff = percentRatioDiff;
      }

      isRatioDiff = new BigNumber(percentRatioDiff).abs().gt(0.1);

      if (!isRatioDiff) break;
      const newPercent = this.getQuantityToSwap({
        difference: percentRatioDiff,
        quantity: quantityToSwap,
      });

      quantityToSwap = this.getNewQuantityToSwap({
        quantityToSwap,
        newPercent,
        percentRatioDiff,
        toSwap,
      });
    } while (isRatioDiff);
    const earn = this.getDiffPercent(
      new BigNumber(row.baseQuantity).times(row.quoteQuantity).sqrt().toFixed(),
      new BigNumber(newBaseQuantity).times(newQuoteQuantity).sqrt().toFixed(),
    );
    if (new BigNumber(earn).lt(0)) return zeroResp;

    const rebalanceBase =
      toSwap === 'quote'
        ? `+ ${swapOutput.amountOut} ${row.base}`
        : `- ${quantityToSwap} ${row.base}`;

    const rebalanceQuote =
      toSwap === 'quote'
        ? `- ${quantityToSwap} ${row.quote}`
        : `+ ${swapOutput.amountOut} ${row.quote}`;

    const from = {
      symbol: row[toSwap],
      quantity: quantityToSwap,
    };

    const to = {
      symbol: row[toSwap === 'base' ? 'quote' : 'base'],
      quantity: swapOutput.amountOut,
    };

    return {
      earn,
      rebalanceBase,
      rebalanceQuote,
      json: swapOutput.json,
      from,
      to,
      priceImpact: swapOutput.priceImpact,
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
      row.earn = formatTwoNumbersAfterZero(earn);
      row.rebalanceBase = rebalanceBase;
      row.rebalanceQuote = rebalanceQuote;
      row.difference = new BigNumber(row.difference).abs().toFixed(2);
      row.holdingsRatio = new BigNumber(row.holdingsRatio).toFixed(
        DEFAULT_PRECISION,
      );
      row.marketRatio = new BigNumber(row.marketRatio).toFixed(
        DEFAULT_PRECISION,
      );
    }

    return openMarkets as RebalanceTableRowType[];
  }

  async getInitialValues({
    account,
    showAll,
  }: GetInitialValuesInterface): Promise<HoldingsType[]> {
    const initialValues = [
      ...REBALANCE_PAIRS_WAIV,
      ...REBALANCE_PAIRS_HIVE,
      ...REBALANCE_PAIRS_BTC,
      ...REBALANCE_PAIRS_ETH,
    ] as HoldingsType[];
    if (showAll) return initialValues;

    const initialHoldings = await this.initialHoldingsRepository.find({
      filter: { account },
    });
    if (initialHoldings.length < 2) return initialValues;
    const tokensArr = initialHoldings.map((el) => el.symbol);
    return initialValues.filter(
      (el) => tokensArr.includes(el.base) && tokensArr.includes(el.quote),
    );
  }

  async getUserRebalanceTable({
    account,
    showAll,
  }: GetUserRebalanceTableInterface): Promise<UserRebalanceTableType> {
    const [user, initialValues, balances, pools] = await Promise.all([
      this.userRebalancingRepository.findOneOrCreate(account),
      this.getInitialValues({ account, showAll }),
      this.getNoZeroBalance(account),
      this.hiveEngineClient.getMarketPools({
        tokenPair: { $in: REBALANCING_POOLS },
      }),
    ]);

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
    });
    if (!earnRebalance.json) {
      return { error: { status: 422, message: 'Marketpools error' } };
    }

    const jsonArray = _.isArray(earnRebalance.json)
      ? earnRebalance.json
      : [earnRebalance.json];
    jsonArray[0].contractPayload.balances =
      this.addBalancesInfoIntoPayload(rebalancePair);

    return {
      from: earnRebalance.from,
      to: earnRebalance.to,
      json: JSON.stringify(jsonArray),
      priceImpact: earnRebalance.priceImpact,
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

  addBalancesInfoIntoPayload(pool: OpenMarketType): BalancesBeforeSwapType {
    return {
      dbField: pool.dbField,
      symbolIn: pool.base,
      symbolOut: pool.quote,
      symbolInQuantity: pool.baseQuantity,
      symbolOutQuantity: pool.quoteQuantity,
    };
  }
}
