import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { InitialHoldingsDocumentType } from './types';
import { Injectable, Logger } from '@nestjs/common';
import {
  CreateHoldingsInterface,
  InitialHoldingsDeleteInterface,
  InitialHoldingsFindInterface,
  InitialHoldingsRepositoryInterface,
  InitialHoldingsUpdateInterface,
} from './interface';
import { InitialHoldings } from './initial-holdings.schema';

@Injectable()
export class InitialHoldingsRepository
  implements InitialHoldingsRepositoryInterface
{
  private readonly logger = new Logger(InitialHoldingsRepository.name);
  constructor(
    @InjectModel(InitialHoldings.name)
    private readonly model: Model<InitialHoldingsDocumentType>,
  ) {}

  async create(
    params: CreateHoldingsInterface,
  ): Promise<InitialHoldingsDocumentType> {
    try {
      return this.model.create(params);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async findOne({
    filter,
    projection,
    options,
  }: InitialHoldingsFindInterface): Promise<InitialHoldingsDocumentType> {
    try {
      return this.model.findOne(filter, projection, options);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async find({
    filter,
    projection,
    options,
  }: InitialHoldingsFindInterface): Promise<InitialHoldingsDocumentType[]> {
    try {
      return this.model.find(filter, projection, options);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async findOneAndUpdate({
    filter,
    update,
    options = { new: true },
  }: InitialHoldingsUpdateInterface): Promise<InitialHoldingsDocumentType> {
    try {
      return this.model.findOneAndUpdate(filter, update, options);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async findOneAndDelete({
    filter,
    options,
  }: InitialHoldingsDeleteInterface): Promise<InitialHoldingsDocumentType> {
    try {
      return this.model.findOneAndDelete(filter, options);
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}
