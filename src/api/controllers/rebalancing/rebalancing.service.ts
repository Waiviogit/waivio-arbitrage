import { Inject, Injectable } from '@nestjs/common';
import { REBALANCING_PROVIDE } from '../../../domain/rebalancing/constants';
import {
  ChangeNotificationSettingsInterface,
  RebalancingInterface,
} from '../../../domain/rebalancing/interface';
import { UserRebalanceTableType } from '../../../domain/rebalancing/types';
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
}
