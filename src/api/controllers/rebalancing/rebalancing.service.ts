import { Injectable } from '@nestjs/common';

@Injectable()
export class RebalancingService {
  async getUserBalance(): Promise<void> {
    console.log('yo');
  }
}
