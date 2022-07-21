import { Provider } from '@nestjs/common';
import { HOLDINGS_PERSISTENCE_PROVIDE } from './constants';
import { InitialHoldingsRepository } from './initial-holdings.repository';

export const InitialHoldingsPersistenceProvider: Provider = {
  provide: HOLDINGS_PERSISTENCE_PROVIDE.REPOSITORY,
  useClass: InitialHoldingsRepository,
};
