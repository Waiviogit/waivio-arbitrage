import { OmitType } from '@nestjs/swagger';
import { ProfitDto } from '../profit.dto';

export class DeleteReportTokenDto extends OmitType(ProfitDto, [
  'account',
  'quantity',
]) {}
