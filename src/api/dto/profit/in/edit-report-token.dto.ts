import { OmitType } from '@nestjs/swagger';
import { ProfitDto } from '../profit.dto';

export class EditReportTokenDto extends OmitType(ProfitDto, ['account']) {}
