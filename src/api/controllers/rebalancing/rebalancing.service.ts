import { Inject, Injectable } from '@nestjs/common';
import { REBALANCING_PROVIDE } from '../../../domain/rebalancing/constants';
import { RebalancingInterface } from '../../../domain/rebalancing/interface';
import { UserRebalanceTableType } from '../../../domain/rebalancing/types';

@Injectable()
export class RebalancingService {
  constructor(
    @Inject(REBALANCING_PROVIDE.MAIN)
    private readonly rebalancing: RebalancingInterface,
  ) {}
  async getUserBalance(account: string): Promise<UserRebalanceTableType> {
    return this.rebalancing.getUserRebalanceTable(account);
  }
}
