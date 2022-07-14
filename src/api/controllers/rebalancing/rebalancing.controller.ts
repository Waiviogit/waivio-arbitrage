import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RebalancingService } from './rebalancing.service';
import { RebalancingControllerDoc } from './rebalancing.controller.doc';
import {
  RebalanceChangeSettingsInDto,
  RebalanceSwapInDto,
  RebalanceTableDto,
  UserRebalancingDto,
} from '../../dto/rebalancing';
import { AuthGuard } from '../../guards';
import { RebalanceSwapOutDto } from '../../dto/rebalancing/out/rebalance-swap-out.dto';

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
  @UseGuards(AuthGuard)
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

  @Post(':account')
  @RebalancingControllerDoc.getUserSwapParams()
  async getUserSwapParams(
    @Param('account') account: string,
    @Body() params: RebalanceSwapInDto,
  ): Promise<RebalanceSwapOutDto> {
    return this.rebalancingService.getUserSwapParams({
      account,
      ...params,
    });
  }
}
