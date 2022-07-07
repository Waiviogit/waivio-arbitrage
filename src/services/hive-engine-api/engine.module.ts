import { Global, Module } from '@nestjs/common';

import { HiveEngineClientProvider } from './engine.provider';

@Global()
@Module({
  providers: [HiveEngineClientProvider],
  exports: [HiveEngineClientProvider],
})
export class EngineModule {}
