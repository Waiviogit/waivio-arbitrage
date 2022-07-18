import {
  EngineBalanceType,
  MarketPoolType,
} from '../../../services/hive-engine-api/types';
import {
  HoldingsType,
  OpenMarketType,
  UserRebalanceTableType,
  UserSwapParamsType,
} from '../types';
import { UserRebalancingDocumentType } from '../../../persistence/user-rebalancing/types';
import { UserRebalancing } from '../../../persistence/user-rebalancing/user-rebalancing.schema';

export interface RebalancingInterface {
  getUserRebalanceTable(account: string): Promise<UserRebalanceTableType>;

  changeNotificationSettings({
    account,
    update,
  }: ChangeNotificationSettingsInterface): Promise<UserRebalancingDocumentType>;

  getUserSwapParams({
    account,
    pair,
  }: GetUserSwapParamsInterface): Promise<UserSwapParamsType>;
}

export interface CalcHoldingsInterface {
  balances: EngineBalanceType[];
  initialValues: HoldingsType[];
}

export interface GetPairRatioBalanceInterface {
  holding: HoldingsType;
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

export interface CalcRatioInterface extends GetDirectPoolMarketInterface {
  key: string;
}

export interface GetPoolMarketInterface {
  market: OpenMarketType;
  pools: MarketPoolType[];
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
  slippage?: number;
}

export interface GetUserSwapParamsInterface {
  account: string;
  pair: string;
}

export interface GetRebalanceSwapOutputInterface {
  row: OpenMarketType;
  pools: MarketPoolType[];
  toSwap: 'base' | 'quote';
  quantityToSwap: string;
  slippage?: number;
}

export interface GetNewQuantityToSwapInterface {
  toSwap: 'base' | 'quote';
  quantityToSwap: string;
  newPercent: string;
  percentRatioDiff: string;
}
