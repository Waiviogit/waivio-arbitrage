import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetRebalanceTableDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    return value === 'true';
  })
  @ApiProperty({ type: Boolean, required: false })
  showAll?: boolean;
}
