import { Global, Module } from '@nestjs/common';

import {
  HiveEngineClientProvider,
  HiveEngineSwapHelperProvider,
} from './engine.provider';

@Global()
@Module({
  providers: [HiveEngineClientProvider, HiveEngineSwapHelperProvider],
  exports: [HiveEngineClientProvider, HiveEngineSwapHelperProvider],
})
export class EngineModule {}
