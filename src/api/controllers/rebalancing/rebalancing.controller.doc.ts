import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { applyDecorators, HttpStatus } from '@nestjs/common';
import {RebalanceTableDto, UserRebalancingDto} from '../../dto/rebalancing';

export class RebalancingControllerDoc {
  static main(): ClassDecorator {
    return applyDecorators(
      ApiTags('rebalancing'),
      ApiResponse({
        status: HttpStatus.FORBIDDEN,
        description: 'Forbidden',
      }),
      ApiResponse({
        status: HttpStatus.UNAUTHORIZED,
        description: 'Unauthorized',
      }),
      ApiResponse({
        status: HttpStatus.BAD_REQUEST,
        description: 'Validation error',
      }),
    );
  }

  static getUserBalance(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'endpoint for user rebalancing table',
        description: 'endpoint for user rebalancing table',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'rebalance table',
        type: RebalanceTableDto,
      }),
    );
  }

  static changeNotificationSettings(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'endpoint for change notifications settings',
        description: 'endpoint for change notifications settings',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'notifications settings',
        type: UserRebalancingDto,
      }),
    );
  }
}
