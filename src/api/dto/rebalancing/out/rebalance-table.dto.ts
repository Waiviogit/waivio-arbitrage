import { ApiProperty } from '@nestjs/swagger';
import {OpenMarketType, RebalanceTableRowType} from '../../../../domain/rebalancing/types';

class RebalancePairDTO {
  @ApiProperty({ type: String })
  base: string;

  @ApiProperty({ type: String })
  quote: string;

  @ApiProperty({ type: String })
  baseQuantity: string;

  @ApiProperty({ type: String })
  quoteQuantity: string;

  @ApiProperty({ type: String })
  holdingsRatio: string;

  @ApiProperty({ type: Boolean })
  directPool: boolean;

  @ApiProperty({ type: String })
  basePool?: string;

  @ApiProperty({ type: String })
  quotePool?: string;

  @ApiProperty({ type: String })
  pool?: string;

  @ApiProperty({ type: String })
  dbField: string;

  @ApiProperty({ type: Boolean })
  active?: boolean;

  @ApiProperty({ type: String })
  marketRatio: string;

  @ApiProperty({ type: String })
  difference: string;

  @ApiProperty({ type: String })
  rebalanceBase: string;

  @ApiProperty({ type: String })
  rebalanceQuote: string;

  @ApiProperty({ type: String })
  earn: string;
}

export class RebalanceTableDto {
  @ApiProperty({ type: Number })
  differencePercent: number;

  @ApiProperty({ type: () => [RebalancePairDTO] })
  table: RebalanceTableRowType[];
}
