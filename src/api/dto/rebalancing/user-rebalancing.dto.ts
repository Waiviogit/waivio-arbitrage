import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UserRebalancingDto {
  @IsString()
  @ApiProperty({ type: String, required: true })
  account: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: Number })
  differencePercent?: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  WAIV_BTC?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  WAIV_HBD?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  WAIV_ETH?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  WAIV_LTC?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  HIVE_HBD?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  HIVE_BTC?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  HIVE_ETH?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  HIVE_LTC?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  BTC_ETH?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  BTC_HBD?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  ETH_HBD?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  SPS_HIVE?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  SPS_ETH?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  SPS_BTC?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ type: Boolean })
  SPS_LTC?: boolean;
}
