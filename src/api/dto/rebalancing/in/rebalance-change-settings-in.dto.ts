import { OmitType } from '@nestjs/swagger';
import { UserRebalancingDto } from '../user-rebalancing.dto';

export class RebalanceChangeSettingsInDto extends OmitType(UserRebalancingDto, [
  'account',
]) {}
