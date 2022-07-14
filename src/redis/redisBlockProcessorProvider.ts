import { Provider } from '@nestjs/common';
import { REDIS_PROVIDERS } from './constants/provider';
import { RedisBlockProcessorClient } from './clients/redis-block-processor.client';
import { RedisNotificationClient } from './clients/redis-notifaction-client';

export const RedisBlockProcessorProvider: Provider = {
  provide: REDIS_PROVIDERS.BLOCK_PROCESSOR,
  useClass: RedisBlockProcessorClient,
};

export const RedisNotificationProvider: Provider = {
  provide: REDIS_PROVIDERS.NOTIFICATION,
  useClass: RedisNotificationClient,
};
