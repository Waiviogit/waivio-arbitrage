import { InitialHoldingsDocumentType } from '../../../persistence/initial-holdings/types';
import { ProfitReportRowType, ProfitReportType } from '../types';
import { EngineBalanceType } from '../../../services/hive-engine-api/types';

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

export interface MapCurrentBalanceInterface {
  balances: EngineBalanceType[];
  initialBalances: InitialHoldingsDocumentType[];
}

export interface CalcProfitInterface {
  table: ProfitReportRowType[];
}
