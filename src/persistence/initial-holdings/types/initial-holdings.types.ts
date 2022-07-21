import { Document } from 'mongoose';
import { InitialHoldings } from '../initial-holdings.schema';

export type InitialHoldingsDocumentType = InitialHoldings & Document;
