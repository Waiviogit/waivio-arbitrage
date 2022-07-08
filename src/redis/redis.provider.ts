import { Provider } from '@nestjs/common';
import { RedisClient } from './clients/redis.client';
import { REDIS_PROVIDERS } from './constants/provider';

export const RedisProvider: Provider = {
  provide: REDIS_PROVIDERS.MAIN,
  useClass: RedisClient,
};
