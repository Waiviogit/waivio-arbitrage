import {
  MarketPoolType,
  SwapJsonType,
} from '../../../services/hive-engine-api/types';

export type HoldingsType = {
  base: string;
  quote: string;
  baseQuantity: string;
  quoteQuantity: string;
  holdingsRatio: string;
  directPool: boolean;
  basePool?: string;
  quotePool?: string;
  pool?: string;
  dbField: string;
  active?: boolean;
};

export type OpenMarketType = HoldingsType & PoolMarket;

export type RebalanceTableRowType = OpenMarketType & {
  earn: string;
  rebalanceBase: string;
  rebalanceQuote: string;
};

export type PoolMarket = {
  marketRatio: string;
  difference: string;
};

export type UserRebalanceTableType = {
  differencePercent: number;
  table: RebalanceTableRowType[];
};

export type EarnRebalanceType = {
  earn: string;
  rebalanceBase: string;
  rebalanceQuote: string;
  json?: SwapJsonType | SwapJsonType[];
  from?: FromToRebalanceType;
  to?: FromToRebalanceType;
};

export type FromToRebalanceType = {
  symbol: string;
  quantity: string;
};

export type PairRatioBalanceType = {
  baseQuantity: string;
  quoteQuantity: string;
  holdingsRatio: string;
};

export type SwapRebalanceOutputType = {
  json: SwapJsonType | SwapJsonType[];
  minAmountOut: string;
  amountOut: string;
  updatedPool: MarketPoolType;
  updatedPoolRatio: string;
};

export type UserSwapParamsType = {
  json?: string;
  from?: FromToRebalanceType;
  to?: FromToRebalanceType;
  error?: ErrorType;
};

export type ErrorType = {
  status: number;
  message: string;
};
