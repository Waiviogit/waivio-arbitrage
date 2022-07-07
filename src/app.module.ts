import { Module } from '@nestjs/common';
import { EngineModule } from './services/hive-engine-api/engine.module';
import { ApiModule } from './api/api.module';
import { DomainModule } from './domain/domain.module';

@Module({
  imports: [EngineModule, ApiModule, DomainModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
