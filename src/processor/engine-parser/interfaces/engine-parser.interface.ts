import { EngineTransactionType } from '../../../services/hive-engine-api/types';

export interface EngineParserInterface {
  parseEngineBlock(transactions: EngineTransactionType[]): void;
}
