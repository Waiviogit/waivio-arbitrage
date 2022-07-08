import { Document } from 'mongoose';
import { UserRebalancing } from '../user-rebalancing.schema';

export type UserRebalancingDocumentType = UserRebalancing & Document;
