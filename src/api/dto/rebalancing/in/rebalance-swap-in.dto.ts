import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DB_REBALANCING_FIELD } from '../../../../domain/rebalancing/constants';
import { Transform } from 'class-transformer';

export class RebalanceSwapInDto {
  @IsOptional()
  @IsNumber()
  @Min(0.005)
  @Max(0.49)
  @Transform(({ value }) => {
    return value / 100;
  })
  @ApiProperty({ type: Number, required: false })
  slippage?: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(Object.values(DB_REBALANCING_FIELD)))
  @ApiProperty({ type: String, enum: Object.values(DB_REBALANCING_FIELD) })
  pair: string;
}
