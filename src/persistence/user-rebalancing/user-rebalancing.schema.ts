import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class UserRebalancing {
  @Prop({ type: String, required: true, unique: true })
  account: string;

  @Prop({ type: Number, default: 5 })
  differencePercent?: number;

  @Prop({ type: Boolean, default: false })
  WAIV_BTC?: boolean;

  @Prop({ type: Boolean, default: false })
  WAIV_HBD?: boolean;

  @Prop({ type: Boolean, default: false })
  WAIV_ETH?: boolean;

  @Prop({ type: Boolean, default: false })
  WAIV_LTC?: boolean;

  @Prop({ type: Boolean, default: false })
  HIVE_HBD?: boolean;

  @Prop({ type: Boolean, default: false })
  HIVE_BTC?: boolean;

  @Prop({ type: Boolean, default: false })
  HIVE_ETH?: boolean;

  @Prop({ type: Boolean, default: false })
  BTC_ETH?: boolean;

  @Prop({ type: Boolean, default: false })
  BTC_HBD?: boolean;

  @Prop({ type: Boolean, default: false })
  ETH_HBD?: boolean;
}

export const UserRebalancingSchema =
  SchemaFactory.createForClass(UserRebalancing);
