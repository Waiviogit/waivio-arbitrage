import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProfitDto, ProfitReportDto } from '../../dto/profit';

export class ProfitControllerDoc {
  static main(): ClassDecorator {
    return applyDecorators(
      ApiTags('profit'),
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

  static addTokenToReport(): MethodDecorator {
    return applyDecorators(
      ApiHeader({
        name: 'access-token',
        required: true,
      }),
      ApiOperation({
        summary: 'endpoint for adding token to report',
        description: 'endpoint for adding token to report',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'token holdings',
        type: ProfitDto,
      }),
    );
  }

  static editQuantity(): MethodDecorator {
    return applyDecorators(
      ApiHeader({
        name: 'access-token',
        required: true,
      }),
      ApiOperation({
        summary: 'endpoint for editing token',
        description: 'endpoint for editing token',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'token holdings',
        type: ProfitDto,
      }),
    );
  }

  static deleteTokenFromReport(): MethodDecorator {
    return applyDecorators(
      ApiHeader({
        name: 'access-token',
        required: true,
      }),
      ApiOperation({
        summary: 'endpoint for deleting token from report',
        description: 'endpoint for deleting token from report',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'token holdings',
        type: ProfitDto,
      }),
    );
  }

  static getReport(): MethodDecorator {
    return applyDecorators(
      ApiOperation({
        summary: 'endpoint profit table',
        description: 'endpoint profit table',
      }),
      ApiResponse({
        status: HttpStatus.OK,
        description: 'profit table',
        type: ProfitReportDto,
      }),
    );
  }
}
