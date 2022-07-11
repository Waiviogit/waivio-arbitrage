import { Injectable } from '@nestjs/common';
import { ENGINE_CONTRACT } from '../../services/hive-engine-api/constants';
import _ from 'lodash';
import { IEngineParser } from './interfaces/engine-parser.interface';
import { EngineTransactionType } from '../../services/hive-engine-api/types';

@Injectable()
export class EngineParser implements IEngineParser {
  constructor(
    // @Inject(PYRAMIDAL_BOT_PROVIDERS.MAIN)
    // private readonly _pyramidalBotDomain: IPyramidalBotDomain,
  ) {
  }

  // почему не работает!!!
  async parseEngineBlock(transactions: EngineTransactionType[]): Promise<void> {
    // TODO пока стоит дев, заменить на стейдж!
    if (process.env.NODE_ENV !== 'development') return;
    console.log('transactions', transactions);

    const marketPool = transactions.filter((transaction) =>
        transaction.contract === ENGINE_CONTRACT.MARKETPOOLS.NAME,
    );
    if (!marketPool.length) return;

     const trigger = this._handleSwapEvents(marketPool);
  }

  /** --------------------------PRIVATE METHODS----------------------------------------*/

  private _handleSwapEvents(marketPool): void  {
    for (const marketPoolElement of marketPool) {
      const payload = jsonHelper.parseJson(_.get(marketPoolElement, 'payload'));
      const logs = jsonHelper.parseJson(_.get(marketPoolElement, 'logs'));
      if (_.isEmpty(logs) || _.has(logs, 'errors')) continue;

      const imbalancedPool = _.find(_.flatten((_.map(PYRAMIDAL_BOTS, 'tokenPairs'))),
        (pair) => _.includes(pair, _.get(payload, 'tokenPair')));
      // if (imbalancedPool) {
      //   return {
      //     tokenPair: imbalancedPool,
      //     transactionId: marketPoolElement.transactionId,
      //   };
      // }
    }
  }
}
