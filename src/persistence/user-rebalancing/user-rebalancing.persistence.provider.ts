import { Provider } from '@nestjs/common';
import { UserRebalancingRepository } from './user-rebalancing.repository';
import { USER_REBALANCING_PROVIDE } from './constants';

export const UserRebalancingPersistenceProvider: Provider = {
  provide: USER_REBALANCING_PROVIDE.REPOSITORY,
  useClass: UserRebalancingRepository,
};
