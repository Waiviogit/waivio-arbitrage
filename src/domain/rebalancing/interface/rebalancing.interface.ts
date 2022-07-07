import {
  EngineBalanceType,
  MarketPoolType,
} from '../../../services/hive-engine-api/types';
import { HoldingsType, OpenMarketType } from '../types';

export interface RebalancingInterface {
  getUserRebalanceTable(account: string): Promise<void>;
}

export interface CalcHoldingsInterface {
  balances: EngineBalanceType[];
}

export interface CalcOpenMarketInterface {
  holdings: HoldingsType[];
  pools: MarketPoolType[];
}

export interface GetDirectPoolMarketInterface {
  pool: MarketPoolType;
  market: OpenMarketType;
}

export interface GetIndirectPoolMarketInterface {
  basePool: MarketPoolType;
  quotePool: MarketPoolType;
  market: OpenMarketType;
}
