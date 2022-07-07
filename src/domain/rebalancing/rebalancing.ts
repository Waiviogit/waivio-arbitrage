import { Injectable } from '@nestjs/common';
import { RebalancingInterface } from './interface';

@Injectable()
export class Rebalancing implements RebalancingInterface {
  async getUserRebalanceTable(account: string): Promise<void> {}
}
