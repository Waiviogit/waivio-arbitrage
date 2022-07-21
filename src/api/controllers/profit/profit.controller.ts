import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  DeleteReportTokenDto,
  EditReportTokenDto,
  ProfitDto,
} from '../../dto/profit';
import { ProfitService } from './profit.service';
import { ProfitControllerDoc } from './profit.controller.doc';

@Controller('profit')
@ProfitControllerDoc.main()
export class ProfitController {
  constructor(private readonly profitService: ProfitService) {}

  @Post('report/:account')
  @ProfitControllerDoc.addTokenToReport()
  async addTokenToReport(
    @Param('account') account: string,
    @Body() params: EditReportTokenDto,
  ): Promise<ProfitDto> {
    return this.profitService.addTokenToReport({
      account,
      ...params,
    });
  }

  @Patch('report/:account')
  @ProfitControllerDoc.editQuantity()
  async editQuantity(
    @Param('account') account: string,
    @Body() params: EditReportTokenDto,
  ): Promise<ProfitDto> {
    return this.profitService.editQuantity({
      account,
      ...params,
    });
  }

  @Delete('report/:account')
  @ProfitControllerDoc.deleteTokenFromReport()
  async deleteTokenFromReport(
    @Param('account') account: string,
    @Body() params: DeleteReportTokenDto,
  ): Promise<ProfitDto> {
    return this.profitService.deleteTokenFromReport({
      account,
      ...params,
    });
  }

  @Get('report/:account')
  async getReport(@Param('account') account: string): Promise<void> {}
}