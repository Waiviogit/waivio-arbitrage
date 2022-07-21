import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class InitialHoldings {
  @Prop({ type: String, required: true })
  account: string;

  @Prop({ type: String, required: true })
  symbol: string;

  @Prop({ type: String, required: true })
  quantity: string;
}

export const InitialHoldingsSchema =
  SchemaFactory.createForClass(InitialHoldings);

InitialHoldingsSchema.index({ account: 1, symbol: 1 }, { unique: true });