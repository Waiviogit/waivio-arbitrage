import { Module } from '@nestjs/common';
import { EngineParserProvider } from './engine-parser/engine-parser.provider';

@Module({
  providers: [EngineParserProvider],
  exports: [EngineParserProvider],
})
export class EngineParserModule {}
