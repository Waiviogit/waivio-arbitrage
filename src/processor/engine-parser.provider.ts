import { Provider } from '@nestjs/common';
import { ENGINE_PARSER_PROVIDERS } from './engine-parser/constants/provider';
import { EngineParser } from './engine-parser/engine-parser';

export const EngineParserProvider: Provider = {
  provide: ENGINE_PARSER_PROVIDERS.MAIN,
  useClass: EngineParser,
};
