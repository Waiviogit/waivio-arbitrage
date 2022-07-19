import { Module, MiddlewareConsumer } from '@nestjs/common';
import { EngineModule } from './services/hive-engine-api/engine.module';
import { ApiModule } from './api/api.module';
import { DomainModule } from './domain/domain.module';
import { DatabaseModule } from './database/database.module';
import { PersistenceModule } from './persistence/persistence.module';
import { RedisClientModule } from './redis/redis.module';
import { BlockProcessorModule } from './processor/block-processor.module';
import { NotificationSocketModule } from './services/notification-socket/notification-socket.module';
import { HttpLogs } from './common/middleware';

@Module({
  imports: [
    DatabaseModule,
    PersistenceModule,
    EngineModule,
    ApiModule,
    DomainModule,
    RedisClientModule,
    BlockProcessorModule,
    NotificationSocketModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(HttpLogs).forRoutes('*');
  }
}
