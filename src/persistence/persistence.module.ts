import { Module } from '@nestjs/common';
import { UserRebalancingPersistenceModule } from './user-rebalancing/user-rebalancing.persistence.module';

@Module({
  imports: [UserRebalancingPersistenceModule],
  exports: [UserRebalancingPersistenceModule],
})
export class PersistenceModule {}
