import { ApiProperty } from '@nestjs/swagger';
import {IsIn, IsNotEmpty, IsNumberString, IsString} from 'class-validator';
import { ENGINE_TOKENS_SUPPORTED } from '../../../domain/rebalancing/constants';

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

  @IsString()
  @IsNotEmpty()
  @IsNumberString()
  @ApiProperty({ type: String })
  quantity: string;
}
