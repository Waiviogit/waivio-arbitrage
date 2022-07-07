import { Module } from '@nestjs/common';
import { RebalancingModule } from './rebalancing/rebalancing.module';

@Module({
  imports: [RebalancingModule],
  exports: [RebalancingModule],
})
export class DomainModule {}
