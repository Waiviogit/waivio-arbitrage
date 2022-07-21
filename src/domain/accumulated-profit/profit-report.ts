import { Inject, Injectable } from '@nestjs/common';
import {
  DeleteTokenFromReportInterface,
  EditReportInterface,
  ProfitReportInterface,
} from './interface';
import { HIVE_ENGINE_PROVIDE } from '../../services/hive-engine-api/constants';
import { HiveEngineClientInterface } from '../../services/hive-engine-api/interface';
import { HOLDINGS_PERSISTENCE_PROVIDE } from '../../persistence/initial-holdings/constants';
import { InitialHoldingsRepositoryInterface } from '../../persistence/initial-holdings/interface';
import { InitialHoldingsDocumentType } from '../../persistence/initial-holdings/types';

@Injectable()
export class ProfitReport implements ProfitReportInterface {
  constructor(
    @Inject(HIVE_ENGINE_PROVIDE.CLIENT)
    private readonly hiveEngineClient: HiveEngineClientInterface,
    @Inject(HOLDINGS_PERSISTENCE_PROVIDE.REPOSITORY)
    private readonly initialHoldingsRepository: InitialHoldingsRepositoryInterface,
  ) {}

  addTokenToReport({
    account,
    symbol,
    quantity,
  }: EditReportInterface): Promise<InitialHoldingsDocumentType> {
    return this.initialHoldingsRepository.create({
      account,
      symbol,
      quantity,
    });
  }

  editTokenQuantity({
    account,
    symbol,
    quantity,
  }: EditReportInterface): Promise<InitialHoldingsDocumentType> {
    return this.initialHoldingsRepository.findOneAndUpdate({
      filter: { account, symbol },
      update: { quantity },
    });
  }

  deleteTokenFromReport({
    account,
    symbol,
  }: DeleteTokenFromReportInterface): Promise<InitialHoldingsDocumentType> {
    return this.initialHoldingsRepository.findOneAndDelete({
      filter: { account, symbol },
    });
  }
}
