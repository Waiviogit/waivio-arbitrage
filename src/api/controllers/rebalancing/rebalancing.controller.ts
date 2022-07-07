import { Controller, Get } from '@nestjs/common';
import { RebalancingService } from './rebalancing.service';

@Controller('rebalancing')
export class RebalancingController {
  constructor(private readonly rebalancingService: RebalancingService) {}

  @Get()
  async getUserBalance(): Promise<void> {
    return this.rebalancingService.getUserBalance();
  }
}
