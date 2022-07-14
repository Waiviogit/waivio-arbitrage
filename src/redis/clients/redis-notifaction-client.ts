import { RedisClient } from './redis.client';
import { DB } from '../constants/redis.constants';

export class RedisNotificationClient extends RedisClient {
  constructor() {
    super(DB.NOTIFICATION);
  }
}
