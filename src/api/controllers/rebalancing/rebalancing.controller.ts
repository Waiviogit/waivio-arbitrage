import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { RebalancingService } from './rebalancing.service';
import { RebalancingControllerDoc } from './rebalancing.controller.doc';
import {
  RebalanceChangeSettingsInDto,
  RebalanceTableDto,
  UserRebalancingDto,
} from '../../dto/rebalancing';

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

  @Patch(':account')
  @RebalancingControllerDoc.changeNotificationSettings()
  async changeNotificationSettings(
    @Param('account') account: string,
    @Body() update: RebalanceChangeSettingsInDto,
  ): Promise<UserRebalancingDto> {
    return this.rebalancingService.changeNotificationSettings({
      account,
      update,
    });
  }
}
