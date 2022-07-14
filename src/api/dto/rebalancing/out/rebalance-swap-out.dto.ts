import { FromToRebalanceType } from '../../../../domain/rebalancing/types';
import { ApiProperty } from '@nestjs/swagger';

class FromToRebalanceDTO {
  @ApiProperty({ type: String })
  symbol: string;

  @ApiProperty({ type: String })
  quantity: string;
}

export class RebalanceSwapOutDto {
  @ApiProperty({ type: String })
  json?: string;

  @ApiProperty({ type: () => FromToRebalanceDTO })
  from?: FromToRebalanceType;

  @ApiProperty({ type: () => FromToRebalanceDTO })
  to?: FromToRebalanceType;

  @ApiProperty({ type: String })
  priceImpact?: string;
}
