import { Provider } from '@nestjs/common';
import { HiveEngineClient } from './hive-engine-client';
import { HIVE_ENGINE_PROVIDE } from './constants';

export const HiveEngineClientProvider: Provider = {
  provide: HIVE_ENGINE_PROVIDE.CLIENT,
  useClass: HiveEngineClient,
};
