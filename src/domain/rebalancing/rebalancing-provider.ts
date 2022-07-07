import { Provider } from '@nestjs/common';

import { REBALANCING_PROVIDE } from './constants';
import { Rebalancing } from './rebalancing';

export const RebalancingProvider: Provider = {
  provide: REBALANCING_PROVIDE.MAIN,
  useClass: Rebalancing,
};
