import { Provider } from '@nestjs/common';
import { PROFIT_PROVIDE } from './constants';
import { ProfitReport } from './profit-report';

export const ProfitReportProvider: Provider = {
  provide: PROFIT_PROVIDE.PROFIT_REPORT,
  useClass: ProfitReport,
};
