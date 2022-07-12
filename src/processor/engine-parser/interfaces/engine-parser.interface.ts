import { EngineTransactionType } from '../../../services/hive-engine-api/types';

export interface IEngineParser {
  parseEngineBlock(transactions: EngineTransactionType[]): void;
}
