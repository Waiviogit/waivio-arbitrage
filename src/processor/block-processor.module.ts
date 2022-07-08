import { Module } from '@nestjs/common';
import { EngineModule } from '../services/hive-engine-api/engine.module';
import { BlockProcessor } from './block-processor';

@Module({
  imports: [EngineModule],
  providers: [BlockProcessor],
})
export class BlockProcessorModule {}
