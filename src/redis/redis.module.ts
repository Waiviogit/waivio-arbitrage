import { Global, Module } from '@nestjs/common';
import { RedisBlockProcessorProvider, RedisNotificationProvider } from "./redisBlockProcessorProvider";

@Global()
@Module({
  providers: [RedisBlockProcessorProvider, RedisNotificationProvider],
  exports: [RedisBlockProcessorProvider, RedisNotificationProvider],
})
export class RedisClientModule {}
