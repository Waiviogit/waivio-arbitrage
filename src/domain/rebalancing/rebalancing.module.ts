import { Module } from '@nestjs/common';
import { RebalancingProvider } from './rebalancing-provider';
import { PersistenceModule } from '../../persistence/persistence.module';

@Module({
  imports: [PersistenceModule],
  providers: [RebalancingProvider],
  exports: [RebalancingProvider],
})
export class RebalancingModule {}
