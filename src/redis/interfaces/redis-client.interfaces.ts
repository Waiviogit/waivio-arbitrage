import { addMemberToZsetType, zsetMembersByScoreType } from '../types/redis.types';

export interface RedisBlockProcessorInterface {
  get(key: string): Promise<string>;
  set(key: string, value: string): Promise<void>;
}

export interface RedisNotificationsInterface {
  zadd(data: addMemberToZsetType): Promise<void>;
  zremrangebyscore(data: zsetMembersByScoreType): Promise<void>;
  zrangebyscore(data: zsetMembersByScoreType): Promise<string[]>;
}
