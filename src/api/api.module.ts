import { Module } from '@nestjs/common';
import { RebalancingController } from './controllers/rebalancing/rebalancing.controller';
import { RebalancingService } from './controllers/rebalancing/rebalancing.service';
import { DomainModule } from '../domain/domain.module';

@Module({
  imports: [DomainModule],
  controllers: [RebalancingController],
  providers: [RebalancingService],
})
export class ApiModule {}
