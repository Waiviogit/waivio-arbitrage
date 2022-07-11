import { Module } from '@nestjs/common';
import { EngineModule } from '../services/hive-engine-api/engine.module';
import { BlockProcessor } from './block-processor';
import { EngineParserModule } from '../domain/engine-parser.module';

@Module({
  imports: [EngineModule, EngineParserModule],
  providers: [BlockProcessor],
})
export class BlockProcessorModule {}
