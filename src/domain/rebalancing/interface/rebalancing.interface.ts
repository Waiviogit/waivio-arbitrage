import {
  EngineBalanceType,
  MarketPoolType,
} from '../../../services/hive-engine-api/types';
import { HoldingsType, OpenMarketType, UserRebalanceTableType } from '../types';
import { UserRebalancingDocumentType } from '../../../persistence/user-rebalancing/types';

export interface RebalancingInterface {
  getUserRebalanceTable(account: string): Promise<UserRebalanceTableType>;
}

export interface CalcHoldingsInterface {
  balances: EngineBalanceType[];
  initialValues: HoldingsType[];
}

export interface CalcOpenMarketInterface {
  holdings: HoldingsType[];
  pools: MarketPoolType[];
}

export interface GetDirectPoolMarketInterface {
  pool: MarketPoolType;
  market: OpenMarketType;
}

export interface CalcRatioInterface extends GetDirectPoolMarketInterface {
  key: string;
}

export interface GetIndirectPoolMarketInterface {
  basePool: MarketPoolType;
  quotePool: MarketPoolType;
  market: OpenMarketType;
}

export interface AddActiveStatusOnPairsInterface {
  holdings: HoldingsType[];
  user: UserRebalancingDocumentType;
}
