import { Inject, Injectable } from '@nestjs/common';
import { PROFIT_PROVIDE } from '../../../domain/accumulated-profit/constants';
import {
  DeleteTokenFromReportInterface,
  EditReportInterface,
  ProfitReportInterface,
} from '../../../domain/accumulated-profit/interface';
import { InitialHoldingsDocumentType } from '../../../persistence/initial-holdings/types';
import { ProfitReportType } from '../../../domain/accumulated-profit/types';
import BigNumber from 'bignumber.js';
import { DEFAULT_PRECISION } from '../../../domain/rebalancing/constants';

@Injectable()
export class ProfitService {
  constructor(
    @Inject(PROFIT_PROVIDE.PROFIT_REPORT)
    private readonly profitReport: ProfitReportInterface,
  ) {}

  async addTokenToReport(
    params: EditReportInterface,
  ): Promise<InitialHoldingsDocumentType> {
    params.quantity = new BigNumber(params.quantity).toFixed(
      DEFAULT_PRECISION,
      BigNumber.ROUND_HALF_UP,
    );
    return this.profitReport.addTokenToReport(params);
  }

  async editQuantity(
    params: EditReportInterface,
  ): Promise<InitialHoldingsDocumentType> {
    params.quantity = new BigNumber(params.quantity).toFixed(
      DEFAULT_PRECISION,
      BigNumber.ROUND_HALF_UP,
    );
    return this.profitReport.editTokenQuantity(params);
  }

  async deleteTokenFromReport(
    params: DeleteTokenFromReportInterface,
  ): Promise<InitialHoldingsDocumentType> {
    return this.profitReport.deleteTokenFromReport(params);
  }

  async getProfitReport(account: string): Promise<ProfitReportType> {
    return this.profitReport.getProfitReport(account);
  }
}
