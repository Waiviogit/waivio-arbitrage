import {
  EngineBalanceType,
  MarketPoolType,
} from '../../../services/hive-engine-api/types';
import { HoldingsType, OpenMarketType, UserRebalanceTableType } from '../types';
import { UserRebalancingDocumentType } from '../../../persistence/user-rebalancing/types';
import { UserRebalancing } from '../../../persistence/user-rebalancing/user-rebalancing.schema';

export interface RebalancingInterface {
  getUserRebalanceTable(account: string): Promise<UserRebalanceTableType>;

  changeNotificationSettings({
    account,
    update,
  }: ChangeNotificationSettingsInterface): Promise<UserRebalancingDocumentType>;
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

export interface ChangeNotificationSettingsInterface {
  account: string;
  update: Omit<UserRebalancing, 'account'>;
}
export interface GetRebalanceTableRowsInterface {
  openMarkets: OpenMarketType[];
  pools: MarketPoolType[];
}

export interface GetEarnRebalanceInterface {
  row: OpenMarketType;
  pools: MarketPoolType[];
}

export interface GetRebalanceSwapOutputInterface {
  row: OpenMarketType;
  pools: MarketPoolType[];
  toSwap: 'base' | 'quote';
  quantityToSwap: string;
  slippage?: number;
}
