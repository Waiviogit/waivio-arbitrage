import { Module } from '@nestjs/common';
import { EngineModule } from '../services/hive-engine-api/engine.module';
import { BlockProcessor } from './block-processor';
import { EngineParserProvider } from './engine-parser.provider';
import { RebalancingModule } from '../domain/rebalancing/rebalancing.module';
import { UserRebalancingPersistenceModule } from '../persistence/user-rebalancing/user-rebalancing.persistence.module';

@Module({
  imports: [EngineModule, RebalancingModule, UserRebalancingPersistenceModule],
  providers: [BlockProcessor, EngineParserProvider],
})
export class BlockProcessorModule {}
