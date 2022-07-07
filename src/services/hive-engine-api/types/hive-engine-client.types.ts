export type EngineQueryType = {
  hostUrl?: string;
  method?: string;
  endpoint?: string;
  id?: string;
  params: EngineParamsType;
};

export type EngineParamsType = {
  contract?: string;
  table?: string;
  query?: object;
  blockNumber?: number;
};

export type EngineProxyType = EngineQueryType & {
  attempts?: number;
};

export type MarketPoolType = {
  _id: string;
  tokenPair: string;
  baseQuantity: string;
  quoteQuantity: string;
  basePrice: string;
  quotePrice: string;
  baseVolume: string;
  quoteVolume: string;
  totalShares: string;
  precision: string;
  creator: string;
};

export type EngineBlockType = {
  _id: number;
  blockNumber: number;
  refHiveBlockNumber: number;
  refHiveBlockId: string;
  prevRefHiveBlockId: string;
  previousHash: string;
  previousDatabaseHash: string;
  timestamp: string;
  transactions: EngineTransactionType[];
  virtualTransactions: unknown[];
  hash: string;
  databaseHash: string;
  merkleRoot: string;
  round: number;
  roundHash: string;
  witness: string;
  signingKey: string;
  roundSignature: string;
};

export type EngineTransactionType = {
  refHiveBlockNumber: number;
  transactionId: string;
  sender: string;
  contract: string;
  action: string;
  payload: string;
  executedCodeHash: string;
  hash: string;
  databaseHash: string;
  logs: string;
};

export type EngineVotingPowerType = {
  _id: EngineVotingPowerIdType;
  rewardPoolId: number;
  account: string;
  lastVoteTimestamp: number;
  votingPower: number;
  downvotingPower: number;
};

export type EngineVotingPowerIdType = {
  rewardPoolId: number;
  account: string;
};

export type EngineRewardPoolType = {
  _id: number;
  symbol: string;
  rewardPool: string;
  lastRewardTimestamp: number;
  lastClaimDecayTimestamp: number;
  createdTimestamp: number;
  config: EngineRewardPoolConfigType;
  pendingClaims: string;
  active: boolean;
  intervalPendingClaims: string;
  intervalRewardPool: string;
};

export type EngineRewardPoolConfigType = {
  postRewardCurve: string;
  postRewardCurveParameter: string;
  curationRewardCurve: string;
  curationRewardCurveParameter: string;
  curationRewardPercentage: number;
  cashoutWindowDays: number;
  rewardPerInterval: string;
  rewardIntervalSeconds: number;
  voteRegenerationDays: number;
  downvoteRegenerationDays: number;
  stakedRewardPercentage: number;
  votePowerConsumption: number;
  downvotePowerConsumption: number;
  tags: string[];
};

export type EngineBalanceType = {
  _id: number;
  account: string;
  symbol: string;
  balance: string;
  stake: string;
  pendingUnstake: string;
  delegationsIn: string;
  delegationsOut: string;
  pendingUndelegations: string;
};
