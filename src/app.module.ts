import { Module } from '@nestjs/common';
import { EngineModule } from './services/hive-engine-api/engine.module';
import { ApiModule } from './api/api.module';
import { DomainModule } from './domain/domain.module';
import { DatabaseModule } from './database/database.module';
import { PersistenceModule } from './persistence/persistence.module';
import { RedisClientModule } from './redis/redis.module';
import { BlockProcessorModule } from './processor/block-processor.module';

@Module({
  imports: [
    DatabaseModule,
    PersistenceModule,
    EngineModule,
    ApiModule,
    DomainModule,
    RedisClientModule,
    BlockProcessorModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
