import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { COLLECTION, CONNECTION_MONGO } from '../../database/constants';
import { InitialHoldingsPersistenceProvider } from './initial-holdings.persistence.provider';
import {
  InitialHoldings,
  InitialHoldingsSchema,
} from './initial-holdings.schema';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: InitialHoldings.name,
          schema: InitialHoldingsSchema,
          collection: COLLECTION.INITIAL_HOLDINGS,
        },
      ],
      CONNECTION_MONGO.ARBITRAGE,
    ),
  ],
  providers: [InitialHoldingsPersistenceProvider],
  exports: [InitialHoldingsPersistenceProvider],
})
export class InitialHoldingsPersistenceModule {}
