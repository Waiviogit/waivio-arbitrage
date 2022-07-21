import { Inject, Injectable } from '@nestjs/common';
import { PROFIT_PROVIDE } from '../../../domain/accumulated-profit/constants';
import {
  DeleteTokenFromReportInterface,
  EditReportInterface,
  ProfitReportInterface,
} from '../../../domain/accumulated-profit/interface';
import { InitialHoldingsDocumentType } from '../../../persistence/initial-holdings/types';

@Injectable()
export class ProfitService {
  constructor(
    @Inject(PROFIT_PROVIDE.PROFIT_REPORT)
    private readonly profitReport: ProfitReportInterface,
  ) {}

  async addTokenToReport(
    params: EditReportInterface,
  ): Promise<InitialHoldingsDocumentType> {
    return this.profitReport.addTokenToReport(params);
  }

  async editQuantity(
    params: EditReportInterface,
  ): Promise<InitialHoldingsDocumentType> {
    return this.profitReport.editTokenQuantity(params);
  }

  async deleteTokenFromReport(
    params: DeleteTokenFromReportInterface,
  ): Promise<InitialHoldingsDocumentType> {
    return this.profitReport.deleteTokenFromReport(params);
  }
}
