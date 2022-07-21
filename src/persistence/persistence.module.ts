import { Module } from '@nestjs/common';
import { UserRebalancingPersistenceModule } from './user-rebalancing/user-rebalancing.persistence.module';
import { InitialHoldingsPersistenceModule } from './initial-holdings/initial-holdings.persistence.module';

@Module({
  imports: [UserRebalancingPersistenceModule, InitialHoldingsPersistenceModule],
  exports: [UserRebalancingPersistenceModule, InitialHoldingsPersistenceModule],
})
export class PersistenceModule {}
