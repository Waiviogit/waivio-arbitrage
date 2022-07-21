import { ProfitReportRowType } from '../../../../domain/accumulated-profit/types';
import { ApiProperty } from '@nestjs/swagger';

class ProfitReportRowDto {
  @ApiProperty({ type: String })
  token: string;

  @ApiProperty({ type: String })
  initial: string;

  @ApiProperty({ type: String })
  current: string;
}

export class ProfitReportDto {
  @ApiProperty({ type: String })
  profit: string;

  @ApiProperty({ type: () => [ProfitReportRowDto] })
  table: ProfitReportRowType[];
}
