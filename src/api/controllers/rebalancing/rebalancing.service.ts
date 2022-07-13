import { HttpException, Inject, Injectable } from '@nestjs/common';
import { REBALANCING_PROVIDE } from '../../../domain/rebalancing/constants';
import {
  ChangeNotificationSettingsInterface,
  GetUserSwapParamsInterface,
  RebalancingInterface,
} from '../../../domain/rebalancing/interface';
import {
  UserRebalanceTableType,
  UserSwapParamsType,
} from '../../../domain/rebalancing/types';
import { UserRebalancingDocumentType } from '../../../persistence/user-rebalancing/types';

@Injectable()
export class RebalancingService {
  constructor(
    @Inject(REBALANCING_PROVIDE.MAIN)
    private readonly rebalancing: RebalancingInterface,
  ) {}
  async getUserBalance(account: string): Promise<UserRebalanceTableType> {
    return this.rebalancing.getUserRebalanceTable(account);
  }

  async changeNotificationSettings({
    account,
    update,
  }: ChangeNotificationSettingsInterface): Promise<UserRebalancingDocumentType> {
    return this.rebalancing.changeNotificationSettings({ account, update });
  }

  async getUserSwapParams(
    params: GetUserSwapParamsInterface,
  ): Promise<UserSwapParamsType> {
    const response = await this.rebalancing.getUserSwapParams(params);
    if (response.error) {
      throw new HttpException(response.error.message, response.error.status);
    }
    return response;
  }
}
