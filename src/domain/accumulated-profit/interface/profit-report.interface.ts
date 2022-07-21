import { InitialHoldingsDocumentType } from '../../../persistence/initial-holdings/types';
import { ProfitReportType } from '../types';

export interface ProfitReportInterface {
  addTokenToReport({
    account,
    symbol,
    quantity,
  }: EditReportInterface): Promise<InitialHoldingsDocumentType>;

  editTokenQuantity({
    account,
    symbol,
    quantity,
  }: EditReportInterface): Promise<InitialHoldingsDocumentType>;

  deleteTokenFromReport({
    account,
    symbol,
  }: DeleteTokenFromReportInterface): Promise<InitialHoldingsDocumentType>;

  getProfitReport(account: string): Promise<ProfitReportType>;
}

export interface EditReportInterface {
  account: string;
  symbol: string;
  quantity: string;
}

export interface DeleteTokenFromReportInterface {
  account: string;
  symbol: string;
}
