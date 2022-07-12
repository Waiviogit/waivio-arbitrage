import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { UserRebalancingDocumentType } from './types';
import { UserRebalancing } from './user-rebalancing.schema';
import { Injectable, Logger } from '@nestjs/common';
import {
  UserRebalancingFindInterface,
  UserRebalancingRepositoryInterface,
  UserRebalancingUpdateInterface,
} from './interface';

@Injectable()
export class UserRebalancingRepository
  implements UserRebalancingRepositoryInterface
{
  private readonly logger = new Logger(UserRebalancingRepository.name);
  constructor(
    @InjectModel(UserRebalancing.name)
    private readonly model: Model<UserRebalancingDocumentType>,
  ) {}

  async create(account: string): Promise<UserRebalancingDocumentType> {
    try {
      return await this.model.create({ account });
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async findOne({
    filter,
    projection,
    options,
  }: UserRebalancingFindInterface): Promise<UserRebalancingDocumentType> {
    try {
      return await this.model.findOne(filter, projection, options);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async find({
    filter = {},
    projection,
    options,
  }: UserRebalancingFindInterface): Promise<UserRebalancingDocumentType[]> {
    try {
      return await this.model.find(filter, projection, options);
    } catch (error) {
      this.logger.error(error.message);
    }
  }

  async findOneOrCreate(account: string): Promise<UserRebalancingDocumentType> {
    const rec = await this.findOne({ filter: { account } });
    if (rec) return rec;
    return this.create(account);
  }

  async findOneAndUpdate({
    filter,
    update,
    options = { new: true },
  }: UserRebalancingUpdateInterface): Promise<UserRebalancingDocumentType> {
    try {
      return await this.model.findOneAndUpdate(filter, update, options);
    } catch (error) {
      this.logger.error(error.message);
    }
  }
}
