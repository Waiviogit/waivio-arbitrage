import { Module } from '@nestjs/common';
import { RebalancingProvider } from './rebalancing-provider';

@Module({
  imports: [],
  providers: [RebalancingProvider],
  exports: [RebalancingProvider],
})
export class RebalancingModule {}
