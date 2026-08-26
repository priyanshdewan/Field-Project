import { Controller, Get, Post } from '@nestjs/common';
import { HealthService } from '../services/health.service';

@Controller('api/health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth() {
    const report = await this.healthService.runFullHealthCheck();
    return {
      success: report.dbStatus === 'up',
      data: report
    };
  }

  @Post('test-email')
  async triggerTestEmail() {
    const report = await this.healthService.runFullHealthCheck();
    const emailResult = await this.healthService.sendHealthAlertEmail(report, true);
    return {
      success: emailResult.sent,
      emailResult,
      data: report
    };
  }
}
