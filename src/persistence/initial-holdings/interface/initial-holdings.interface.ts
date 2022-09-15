import { InitialHoldingsDocumentType } from '../types';
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';

export interface InitialHoldingsRepositoryInterface {
  create(params: CreateHoldingsInterface): Promise<InitialHoldingsDocumentType>;

  findOne({
    filter,
    projection,
    options,
  }: InitialHoldingsFindInterface): Promise<InitialHoldingsDocumentType>;

  find({
    filter,
    projection,
    options,
  }: InitialHoldingsFindInterface): Promise<InitialHoldingsDocumentType[]>;

  findOneAndUpdate({
    filter,
    update,
    options,
  }: InitialHoldingsUpdateInterface): Promise<InitialHoldingsDocumentType>;

  findOneAndDelete({
    filter,
    options,
  }: InitialHoldingsDeleteInterface): Promise<InitialHoldingsDocumentType>;
}

export interface CreateHoldingsInterface {
  account: string;
  symbol: string;
  quantity: string;
  externalQuantity?: string;
}

export interface InitialHoldingsFindInterface {
  filter: FilterQuery<InitialHoldingsDocumentType>;
  projection?: object | string | string[];
  options?: QueryOptions;
}

export interface InitialHoldingsUpdateInterface {
  filter: FilterQuery<InitialHoldingsDocumentType>;
  update: UpdateQuery<InitialHoldingsDocumentType>;
  options?: QueryOptions;
}

export interface InitialHoldingsDeleteInterface {
  filter: FilterQuery<InitialHoldingsDocumentType>;
  options?: QueryOptions;
}
