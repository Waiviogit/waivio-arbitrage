import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ProfitDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  account: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  symbol: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  quantity: string;
}
