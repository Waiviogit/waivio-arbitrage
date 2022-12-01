import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  DeleteReportTokenDto,
  EditReportTokenDto,
  ProfitDto,
  ProfitReportDto,
} from '../../dto/profit';
import { ProfitService } from './profit.service';
import { ProfitControllerDoc } from './profit.controller.doc';
import { AuthGuard } from '../../guards';

@Controller('profit')
@ProfitControllerDoc.main()
export class ProfitController {
  constructor(private readonly profitService: ProfitService) {}

  @Post('report/:account')
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
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
  @ProfitControllerDoc.getReport()
  async getReport(@Param('account') account: string): Promise<ProfitReportDto> {
    return this.profitService.getProfitReport(account);
  }

  @Get('tokens')
  @ProfitControllerDoc.getTokens()
  async getTokens(): Promise<string[]> {
    return this.profitService.getTokens();
  }
}
