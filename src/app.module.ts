import { Module } from '@nestjs/common';
import { EngineModule } from './services/hive-engine-api/engine.module';
import { ApiModule } from './api/api.module';

@Module({
  imports: [EngineModule, ApiModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
