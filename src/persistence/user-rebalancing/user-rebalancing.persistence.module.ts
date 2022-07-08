import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { COLLECTION, CONNECTION_MONGO } from '../../database/constants';
import {
  UserRebalancing,
  UserRebalancingSchema,
} from './user-rebalancing.schema';
import { UserRebalancingPersistenceProvider } from './user-rebalancing.persistence.provider';

@Module({
  imports: [
    MongooseModule.forFeature(
      [
        {
          name: UserRebalancing.name,
          schema: UserRebalancingSchema,
          collection: COLLECTION.REBALANCING,
        },
      ],
      CONNECTION_MONGO.WAIVIO,
    ),
  ],
  providers: [UserRebalancingPersistenceProvider],
  exports: [UserRebalancingPersistenceProvider],
})
export class UserRebalancingPersistenceModule {}
