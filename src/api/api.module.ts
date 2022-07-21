import { Module } from '@nestjs/common';
import { RebalancingController } from './controllers/rebalancing/rebalancing.controller';
import { RebalancingService } from './controllers/rebalancing/rebalancing.service';
import { DomainModule } from '../domain/domain.module';
import { ProfitController } from './controllers/profit/profit.controller';
import { ProfitService } from './controllers/profit/profit.service';

@Module({
  imports: [DomainModule],
  controllers: [RebalancingController, ProfitController],
  providers: [RebalancingService, ProfitService],
})
export class ApiModule {}
