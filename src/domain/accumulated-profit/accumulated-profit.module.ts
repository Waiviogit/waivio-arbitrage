import { Module } from '@nestjs/common';
import { PersistenceModule } from '../../persistence/persistence.module';
import { ProfitReportProvider } from './profit.provider';

@Module({
  imports: [PersistenceModule],
  providers: [ProfitReportProvider],
  exports: [ProfitReportProvider],
})
export class AccumulatedProfitModule {}
