import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as _ from 'lodash';
import {
  ENGINE_CONTRACT,
  ENGINE_ENDPOINT,
  ENGINE_ID,
  ENGINE_METHOD,
  HIVE_ENGINE_NODES,
  REWARD_POOL_ID,
} from './constants';
import {
  EngineBalanceType,
  EngineBlockType,
  EngineProxyType,
  EngineQueryType,
  EngineRewardPoolType,
  EngineVotingPowerType,
  MarketPoolType,
} from './types';
import { HiveEngineClientInterface } from './interface';

@Injectable()
export class HiveEngineClient implements HiveEngineClientInterface {
  private readonly logger = new Logger(HiveEngineClient.name);

  private async engineQuery({
    hostUrl = HIVE_ENGINE_NODES[0],
    method = ENGINE_METHOD.FIND,
    params,
    endpoint = ENGINE_ENDPOINT.CONTRACTS,
    id = ENGINE_ID.MAIN_NET,
  }: EngineQueryType): Promise<unknown> {
    try {
      const resp = await axios.post(`${hostUrl}${endpoint}`, {
        jsonrpc: '2.0',
        method,
        params,
        id,
      });
      return _.get(resp, 'data.result');
    } catch (error) {
      this.logger.error(error.message);
      return { error };
    }
  }

  private async engineProxy({
    hostUrl,
    method,
    params,
    endpoint,
    id,
    attempts = 5,
  }: EngineProxyType): Promise<unknown> {
    const response = await this.engineQuery({
      hostUrl,
      method,
      params,
      endpoint,
      id,
    });
    if (_.has(response, 'error')) {
      if (attempts <= 0) return response;
      return this.engineProxy({
        hostUrl: this.getNewNodeUrl(hostUrl),
        method,
        params,
        endpoint,
        id,
        attempts: attempts - 1,
      });
    }
    return response;
  }

  private getNewNodeUrl(hostUrl): string {
    const index = hostUrl ? HIVE_ENGINE_NODES.indexOf(hostUrl) : 0;

    return index === HIVE_ENGINE_NODES.length - 1
      ? HIVE_ENGINE_NODES[0]
      : HIVE_ENGINE_NODES[index + 1];
  }

  async getMarketPool(query: object): Promise<MarketPoolType> {
    return (await this.engineProxy({
      method: ENGINE_METHOD.FIND_ONE,
      params: {
        contract: ENGINE_CONTRACT.MARKETPOOLS.NAME,
        table: ENGINE_CONTRACT.MARKETPOOLS.TABLE.POOLS,
        query,
      },
    })) as MarketPoolType;
  }

  async getMarketPools(query: object): Promise<MarketPoolType[]> {
    return (await this.engineProxy({
      method: ENGINE_METHOD.FIND,
      params: {
        contract: ENGINE_CONTRACT.MARKETPOOLS.NAME,
        table: ENGINE_CONTRACT.MARKETPOOLS.TABLE.POOLS,
        query,
      },
    })) as MarketPoolType[];
  }

  async getBlock(blockNumber: number): Promise<EngineBlockType> {
    return (await this.engineProxy({
      method: ENGINE_METHOD.GET_BLOCK_INFO,
      endpoint: ENGINE_ENDPOINT.BLOCKCHAIN,
      params: { blockNumber },
    })) as EngineBlockType;
  }

  async getVotingPower(
    account: string,
    symbol: string,
  ): Promise<EngineVotingPowerType> {
    const rewardPoolId = REWARD_POOL_ID[symbol];
    return (await this.engineProxy({
      method: ENGINE_METHOD.FIND_ONE,
      endpoint: ENGINE_ENDPOINT.CONTRACTS,
      params: {
        contract: ENGINE_CONTRACT.COMMENTS.NAME,
        table: ENGINE_CONTRACT.COMMENTS.TABLE.VOTING_POWER,
        query: { rewardPoolId, account },
      },
    })) as EngineVotingPowerType;
  }

  async getRewardPool(symbol: string): Promise<EngineRewardPoolType> {
    return (await this.engineProxy({
      method: ENGINE_METHOD.FIND_ONE,
      endpoint: ENGINE_ENDPOINT.CONTRACTS,
      params: {
        contract: ENGINE_CONTRACT.COMMENTS.NAME,
        table: ENGINE_CONTRACT.COMMENTS.TABLE.REWARD_POOLS,
        query: { symbol },
      },
    })) as EngineRewardPoolType;
  }

  async getTokenBalance(
    account: string,
    symbol: string,
  ): Promise<EngineBalanceType> {
    return (await this.engineProxy({
      method: ENGINE_METHOD.FIND_ONE,
      endpoint: ENGINE_ENDPOINT.CONTRACTS,
      params: {
        contract: ENGINE_CONTRACT.TOKENS.NAME,
        table: ENGINE_CONTRACT.TOKENS.TABLE.BALANCES,
        query: { symbol, account },
      },
    })) as EngineBalanceType;
  }

  async getTokenBalances(query: object): Promise<EngineBalanceType[]> {
    return (await this.engineProxy({
      method: ENGINE_METHOD.FIND,
      endpoint: ENGINE_ENDPOINT.CONTRACTS,
      params: {
        contract: ENGINE_CONTRACT.TOKENS.NAME,
        table: ENGINE_CONTRACT.TOKENS.TABLE.BALANCES,
        query,
      },
    })) as EngineBalanceType[];
  }
}
