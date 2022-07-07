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
};
