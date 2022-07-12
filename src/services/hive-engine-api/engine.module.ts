import { Global, Module } from '@nestjs/common';

import {
  HiveEngineClientProvider,
  HiveEngineSwapHelperProvider,
} from './engine.provider';
import { NotificationSocketClient } from '../notification-socket/notification-socket.client';

@Global()
@Module({
  providers: [
    HiveEngineClientProvider,
    HiveEngineSwapHelperProvider,
    NotificationSocketClient,
  ],
  exports: [
    HiveEngineClientProvider,
    HiveEngineSwapHelperProvider,
    NotificationSocketClient,
  ],
})
export class EngineModule {}
