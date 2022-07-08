import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class UserRebalancing {
  @Prop({ type: String, required: true, unique: true })
  account: string;

  @Prop({ type: Number, default: 5 })
  differencePercent?: number;
}

export const UserRebalancingSchema =
  SchemaFactory.createForClass(UserRebalancing);
