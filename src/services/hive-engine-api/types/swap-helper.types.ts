import { MarketPoolType } from './hive-engine-client.types';

export type SwapOutputType = {
  json: SwapJsonType;
  minAmountOut: string;
  amountOut: string;
  updatedPool: MarketPoolType;
};

export type SwapJsonType = {
  contractAction: string;
  contractPayload: {
    tokenSymbol: string;
    tokenAmount: string;
    minAmountOut: string;
    tradeType: string;
    tokenPair: string;
    balances?: BalancesBeforeSwapType;
  };
  contractName: string;
};

export type BalancesBeforeSwapType = {
  dbField: string;
  baseSymbol: string;
  quoteSymbol: string;
  baseQuantity: string;
  quoteQuantity: string;
};
