import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ versionKey: false })
export class InitialHoldings {
  @Prop({ type: String, required: true })
  account: string;

  @Prop({ type: String, required: true })
  symbol: string;

  @Prop({ type: String, required: true })
  quantity: string;

  @Prop({ type: String, default: '0' })
  externalQuantity?: string;
}

export const InitialHoldingsSchema =
  SchemaFactory.createForClass(InitialHoldings);

InitialHoldingsSchema.index({ account: 1, symbol: 1 }, { unique: true });
