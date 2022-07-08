import { Logger, OnModuleInit } from '@nestjs/common';
import { IBlockProcessor } from '../interfaces/redis-client.interfaces';
import { createClient } from 'redis';
import { configService } from '../../common/config';

export class RedisClient
  implements OnModuleInit, IBlockProcessor {
  private _client;
  private readonly _logger = new Logger(RedisClient.name);

  constructor() {
    this._client = createClient({ url: configService.getRedisConfig() });
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
}
