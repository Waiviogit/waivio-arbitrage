import { EngineBalanceType } from '../../../services/hive-engine-api/types';

export interface RebalancingInterface {
  getUserRebalanceTable(account: string): Promise<void>;
}

export interface CalcHoldingsInterface {
  balances: EngineBalanceType[];
}
