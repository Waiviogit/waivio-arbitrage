import { UserRebalancingDocumentType } from '../types';
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';

export interface UserRebalancingRepositoryInterface {
  create(account: string): Promise<UserRebalancingDocumentType>;

  findOne({
    filter,
    projection,
    options,
  }: UserRebalancingFindInterface): Promise<UserRebalancingDocumentType>;

  find({
    filter,
    projection,
    options,
  }: UserRebalancingFindInterface): Promise<UserRebalancingDocumentType[]>;

  findOneOrCreate(account: string): Promise<UserRebalancingDocumentType>;

  findOneAndUpdate({
    filter,
    update,
    options,
  }: UserRebalancingUpdateInterface): Promise<UserRebalancingDocumentType>;
}

export interface UserRebalancingFindInterface {
  filter: FilterQuery<UserRebalancingDocumentType>;
  projection?: object | string | string[];
  options?: QueryOptions;
}

export interface UserRebalancingUpdateInterface {
  filter: FilterQuery<UserRebalancingDocumentType>;
  update: UpdateQuery<UserRebalancingDocumentType>;
  options?: QueryOptions;
}
