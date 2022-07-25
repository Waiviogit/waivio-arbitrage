import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { configService } from '../common/config';
import { CONNECTION_MONGO } from './constants';

@Module({
  imports: [
    MongooseModule.forRoot(configService.getMongoArbitrageConnectionString(), {
      connectionName: CONNECTION_MONGO.ARBITRAGE,
    }),
  ],
})
export class DatabaseModule {}
