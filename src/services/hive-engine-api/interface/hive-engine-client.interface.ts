import {
  EngineBalanceType,
  EngineBlockType,
  EngineRewardPoolType,
  EngineTokenType,
  EngineVotingPowerType,
  MarketPoolType,
} from '../types';

export interface HiveEngineClientInterface {
  getMarketPool(query: object): Promise<MarketPoolType>;

  getMarketPools(query: object): Promise<MarketPoolType[]>;

  getBlock(blockNumber: number, hostUrl: string): Promise<EngineBlockType>;

  getVotingPower(
    account: string,
    symbol: string,
  ): Promise<EngineVotingPowerType>;

  getRewardPool(symbol: string): Promise<EngineRewardPoolType>;

  getTokenBalance(account: string, symbol: string): Promise<EngineBalanceType>;

  getTokenBalances(query: object): Promise<EngineBalanceType[]>;

  getTokens(query: object): Promise<EngineTokenType[]>;
}
