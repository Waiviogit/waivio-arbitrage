import { InitialHoldingsDocumentType } from '../../../persistence/initial-holdings/types';

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
