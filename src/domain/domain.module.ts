import { Module } from '@nestjs/common';
import { RebalancingModule } from './rebalancing/rebalancing.module';
import { AccumulatedProfitModule } from './accumulated-profit/accumulated-profit.module';

@Module({
  imports: [RebalancingModule, AccumulatedProfitModule],
  exports: [RebalancingModule, AccumulatedProfitModule],
})
export class DomainModule {}
