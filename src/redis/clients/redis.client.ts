import { Logger, OnModuleInit } from '@nestjs/common';
import { RedisBlockProcessorInterface, RedisNotificationsInterface } from "../interfaces/redis-client.interfaces";
import { createClient } from 'redis';
import { configService } from '../../common/config';
import { addMemberToZsetType, zsetMembersByScoreType } from "../types/redis.types";

export abstract class RedisClient
  implements OnModuleInit, RedisBlockProcessorInterface, RedisNotificationsInterface {
  private _client;
  private readonly _logger = new Logger(RedisClient.name);

  protected constructor(db?: string) {
    this._client = createClient({ url: configService.getRedisConfig(db) });
    this._client.on('error', (err) => console.log('Redis Client Error', err));
  }

  async onModuleInit(): Promise<void> {
    try {
      await this._client.connect();
    } catch (error) {
      this._logger.error(error.message);
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      await this._client.set(key, value);
    } catch (error) {
      this._logger.error(error.message);
    }
  }

  async get(key: string): Promise<string | undefined> {
    try {
      return this._client.get(key);
    } catch (error) {
      this._logger.error(error.message);
    }
  }

  async zadd({ key, value, score }: addMemberToZsetType): Promise<void> {
    try {
      await this._client.zAdd(key, { value, score });
    } catch (error) {
      this._logger.error(error.message);
    }
  }

  async zremrangebyscore({
    key,
    min,
    max,
  }: zsetMembersByScoreType): Promise<void> {
    try {
      await this._client.zRemRangeByScore(key, min, max);
    } catch (error) {
      this._logger.error(error.message);
    }
  }

  async zrangebyscore({
    key,
    min,
    max,
  }: zsetMembersByScoreType): Promise<string[]> {
    try {
      return this._client.zRangeByScore(key, min, max);
    } catch (error) {
      this._logger.error(error.message);

      return [];
    }
  }
}
