import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DB_REBALANCING_FIELD } from '../../../../domain/rebalancing/constants';

export class RebalanceSwapInDto {
  @IsOptional()
  @IsNumber()
  @ApiProperty({ type: Number, required: false })
  slippage?: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(Object.values(DB_REBALANCING_FIELD)))
  @ApiProperty({ type: String, enum: Object.values(DB_REBALANCING_FIELD) })
  pair: string;
}
