import { Provider } from '@nestjs/common';
import { ENGINE_PARSER_PROVIDERS } from './constants';
import { EngineParser } from './engine-parser';

export const EngineParserProvider: Provider = {
  provide: ENGINE_PARSER_PROVIDERS.MAIN,
  useClass: EngineParser,
};
