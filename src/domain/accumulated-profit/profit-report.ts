import { Inject, Injectable } from '@nestjs/common';
import {
  CalcProfitInterface,
  DeleteTokenFromReportInterface,
  EditReportInterface,
  MapCurrentBalanceInterface,
  ProfitReportInterface,
} from './interface';
import { HIVE_ENGINE_PROVIDE } from '../../services/hive-engine-api/constants';
import { HiveEngineClientInterface } from '../../services/hive-engine-api/interface';
import { HOLDINGS_PERSISTENCE_PROVIDE } from '../../persistence/initial-holdings/constants';
import { InitialHoldingsRepositoryInterface } from '../../persistence/initial-holdings/interface';
import { InitialHoldingsDocumentType } from '../../persistence/initial-holdings/types';
import { ProfitReportRowType, ProfitReportType } from './types';
import * as _ from 'lodash';
import BigNumber from 'bignumber.js';
import { formatTwoNumbersAfterZero } from '../../common/helpers';

@Injectable()
export class ProfitReport implements ProfitReportInterface {
  constructor(
    @Inject(HIVE_ENGINE_PROVIDE.CLIENT)
    private readonly hiveEngineClient: HiveEngineClientInterface,
    @Inject(HOLDINGS_PERSISTENCE_PROVIDE.REPOSITORY)
    private readonly initialHoldingsRepository: InitialHoldingsRepositoryInterface,
  ) {}

  addTokenToReport(
    params: EditReportInterface,
  ): Promise<InitialHoldingsDocumentType> {
    return this.initialHoldingsRepository.create(params);
  }

  editTokenQuantity(
    params: EditReportInterface,
  ): Promise<InitialHoldingsDocumentType> {
    const { account, symbol } = params;

    return this.initialHoldingsRepository.findOneAndUpdate({
      filter: { account, symbol },
      update: _.omit(params, ['account', 'symbol']),
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

  mapCurrentBalance({
    initialBalances,
    balances,
  }: MapCurrentBalanceInterface): ProfitReportRowType[] {
    return initialBalances.map((initial) => {
      const current = balances.find((b) => b.symbol === initial.symbol);

      const external = initial.externalQuantity;
      const currentBalance = current
        ? new BigNumber(current.balance)
            .plus(initial.externalQuantity)
            .toFixed()
        : initial.externalQuantity;

      const externalPercent = new BigNumber(100)
        .times(external)
        .div(currentBalance)
        .toFixed(2);

      return {
        token: initial.symbol,
        initial: new BigNumber(initial.quantity)
          .plus(initial.externalQuantity)
          .toFixed(),
        current: currentBalance,
        external,
        externalPercent,
      };
    });
  }

  calcProfit({ table }: CalcProfitInterface): string {
    const { before, after } = table.reduce(
      (acc, el) => {
        acc.before = acc.before.times(el.initial);
        acc.after = acc.after.times(el.current);
        return acc;
      },
      { before: new BigNumber(1), after: new BigNumber(1) },
    );

    const s2 = new BigNumber(Math.pow(after.toNumber(), 1 / table.length));
    const s1 = new BigNumber(Math.pow(before.toNumber(), 1 / table.length));
    // return s2.minus(s1).div(s1).times(100).toFixed();

    return formatTwoNumbersAfterZero(s2.div(s1).minus(1).times(100).toFixed());
  }

  async getProfitReport(account: string): Promise<ProfitReportType> {
    const initialBalances = await this.initialHoldingsRepository.find({
      filter: { account },
    });
    if (_.isEmpty(initialBalances)) {
      return { table: [], profit: '0' };
    }

    const balances = await this.hiveEngineClient.getTokenBalances({
      account,
      symbol: { $in: _.map(initialBalances, 'symbol') },
    });

    const table = this.mapCurrentBalance({ initialBalances, balances });
    const profit = this.calcProfit({ table });
    return {
      table,
      profit,
    };
  }
}
