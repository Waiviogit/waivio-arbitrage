import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsString,
  IsNumberString,
  Validate,
} from 'class-validator';
import { ENGINE_TOKENS_SUPPORTED } from '../../../domain/rebalancing/constants';
import { CustomStringMin } from '../../../common/validators';

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

  @IsNumberString()
  @Validate(CustomStringMin, [0.00000001])
  @ApiProperty({ type: String })
  quantity: string;
}
