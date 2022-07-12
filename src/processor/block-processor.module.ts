import { Module } from '@nestjs/common';
import { EngineModule } from '../services/hive-engine-api/engine.module';
import { BlockProcessor } from './block-processor';
import { EngineParserProvider } from './engine-parser.provider';
import { RebalancingModule } from '../domain/rebalancing/rebalancing.module';
import { UserRebalancingPersistenceModule } from '../persistence/user-rebalancing/user-rebalancing.persistence.module';
import { NotificationSocketClient } from '../services/notification-socket/notification-socket.client';

@Module({
  imports: [
    EngineModule,
    RebalancingModule,
    UserRebalancingPersistenceModule,
    NotificationSocketClient,
  ],
  providers: [BlockProcessor, EngineParserProvider],
})
export class BlockProcessorModule {}
