import { Module } from '@nestjs/common';
import { RebalancingController } from './controllers/rebalancing/rebalancing.controller';
import { RebalancingService } from './controllers/rebalancing/rebalancing.service';

@Module({
  imports: [],
  controllers: [RebalancingController],
  providers: [RebalancingService],
})
export class ApiModule {}
