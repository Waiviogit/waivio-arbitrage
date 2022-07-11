export type SwapOutputType = {
  json: SwapJsonType;
  minAmountOut: string;
  amountOut: string;
};

export type SwapJsonType = {
  contractAction: string;
  contractPayload: {
    tokenSymbol: string;
    tokenAmount: string;
    minAmountOut: string;
    tradeType: string;
    tokenPair: string;
  };
  contractName: string;
};
