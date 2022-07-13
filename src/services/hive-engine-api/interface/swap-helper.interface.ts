import { MarketPoolType, SwapOutputType } from '../types';
import BigNumber from 'bignumber.js';

export interface SwapHelperInterface {
  getSwapOutput({
    symbol,
    amountIn,
    pool,
    slippage,
    tradeFeeMul,
    precision,
  }: GetSwapOutputInterface): SwapOutputType;
}

export interface GetSwapOutputInterface {
  symbol: string;
  amountIn: string;
  pool: MarketPoolType;
  slippage: number;
  tradeFeeMul: number;
  precision: number;
}

export interface GetAmountOutInterface {
  tokenAmount: string | BigNumber;
  liquidityIn: string;
  liquidityOut: string;
  tradeFeeMul: number;
}

export interface OperationForJsonInterface {
  tokenPair: string;
  minAmountOut: string;
  tokenSymbol: string;
  tokenAmount: string;
}

export interface GetUpdatedPoolStatsInterface {
  pool: MarketPoolType;
  baseAdjusted: BigNumber;
  quoteAdjusted: BigNumber;
}
