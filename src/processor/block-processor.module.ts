import { Module } from '@nestjs/common';
import { BlockProcessor } from './block-processor';
import { EngineParserProvider } from './engine-parser/engine-parser.provider';
import { RebalancingModule } from '../domain/rebalancing/rebalancing.module';
import { UserRebalancingPersistenceModule } from '../persistence/user-rebalancing/user-rebalancing.persistence.module';
import { NotificationSocketModule } from '../services/notification-socket/notification-socket.module';

@Module({
  imports: [
    RebalancingModule,
    UserRebalancingPersistenceModule,
    NotificationSocketModule,
  ],
  providers: [BlockProcessor, EngineParserProvider],
})
export class BlockProcessorModule {}
