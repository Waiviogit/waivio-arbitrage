import { Controller, Get, Param } from '@nestjs/common';
import { RebalancingService } from './rebalancing.service';
import { RebalancingControllerDoc } from './rebalancing.controller.doc';
import { RebalanceTableDto } from '../../dto/rebalancing';

@Controller('rebalancing')
@RebalancingControllerDoc.main()
export class RebalancingController {
  constructor(private readonly rebalancingService: RebalancingService) {}

  @Get(':account')
  @RebalancingControllerDoc.getUserBalance()
  async getUserBalance(
    @Param('account') account: string,
  ): Promise<RebalanceTableDto> {
    return this.rebalancingService.getUserBalance(account);
  }
}
