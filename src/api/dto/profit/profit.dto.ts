import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ENGINE_TOKENS_SUPPORTED } from '../../../domain/rebalancing/constants';
import { Type } from 'class-transformer';

export class ProfitDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  account: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(Object.values(ENGINE_TOKENS_SUPPORTED))
  @ApiProperty({ type: String, enum: Object.values(ENGINE_TOKENS_SUPPORTED) })
  symbol: string;

  @IsNumber()
  @Min(0.00000001)
  @Type(() => Number)
  @ApiProperty({ type: String })
  quantity: string;
}
