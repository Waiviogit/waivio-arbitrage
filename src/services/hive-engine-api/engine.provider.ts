import { Provider } from '@nestjs/common';
import { HiveEngineClient } from './hive-engine-client';
import { HIVE_ENGINE_PROVIDE } from './constants';
import { SwapHelper } from './swap-helper';

export const HiveEngineClientProvider: Provider = {
  provide: HIVE_ENGINE_PROVIDE.CLIENT,
  useClass: HiveEngineClient,
};

export const HiveEngineSwapHelperProvider: Provider = {
  provide: HIVE_ENGINE_PROVIDE.SWAP_HELPER,
  useClass: SwapHelper,
};
