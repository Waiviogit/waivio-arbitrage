export interface RebalancingInterface {
  getUserRebalanceTable(account: string): Promise<void>;
}
