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

export type OpenMarketType = HoldingsType & DirectPoolMarket;

export type DirectPoolMarket = {
  marketRatio: string;
  difference: string;
};

export type UserRebalanceTableType = {
  differencePercent: number;
  table: OpenMarketType[];
};
