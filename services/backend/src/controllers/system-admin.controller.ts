import { Controller, Get, Post, Body, Req, Query } from '@nestjs/common';
import { SystemAdminService } from '../services/system-admin.service';

@Controller(['api/system-admin', 'api/admin'])
export class SystemAdminController {
  constructor(private readonly sysAdminService: SystemAdminService) {}

  @Get('dashboard')
  async getDashboard(@Req() req) {
    return await this.sysAdminService.getDashboard(req.user);
  }

  @Post('approve')
  async approveRegistration(@Req() req, @Body('id') id: string) {
    const ip = req.ip;
    const ua = req.headers['user-agent'];
    return await this.sysAdminService.approveRegistration(req.user, id, ip, ua);
  }

  @Post('reject')
  async rejectRegistration(@Req() req, @Body('id') id: string, @Body('reason') reason: string) {
    const ip = req.ip;
    const ua = req.headers['user-agent'];
    return await this.sysAdminService.rejectRegistration(req.user, id, reason, ip, ua);
  }

  @Post('suspend')
  async suspendRegistration(@Req() req, @Body('id') id: string, @Body('reason') reason: string) {
    const ip = req.ip;
    const ua = req.headers['user-agent'];
    return await this.sysAdminService.suspendRegistration(req.user, id, reason, ip, ua);
  }

  @Post('delete')
  async deleteRegistration(@Req() req, @Body('id') id: string) {
    return await this.sysAdminService.deleteRegistration(req.user, id);
  }

  @Get('companies')
  async searchCompanies(@Req() req, @Query('query') query: string) {
    return await this.sysAdminService.searchCompanies(req.user, query);
  }

  @Get('companies/search')
  async searchCompaniesAlt(@Req() req, @Query('query') query: string) {
    return await this.sysAdminService.searchCompanies(req.user, query);
  }

  @Post('suspend-workspace')
  async suspendWorkspace(@Req() req, @Body('id') id: string) {
    return await this.sysAdminService.suspendWorkspace(req.user, id, req.ip, req.headers['user-agent']);
  }

  @Post('reactivate-workspace')
  async reactivateWorkspace(@Req() req, @Body('id') id: string) {
    return await this.sysAdminService.reactivateWorkspace(req.user, id, req.ip, req.headers['user-agent']);
  }

  @Post('delete-workspace')
  async deleteWorkspace(@Req() req, @Body('id') id: string) {
    return await this.sysAdminService.deleteWorkspace(req.user, id, req.ip, req.headers['user-agent']);
  }

  @Post('reset-password')
  async resetPassword(@Req() req, @Body('workspaceId') workspaceId: string, @Body('password') password?: string) {
    return await this.sysAdminService.resetOwnerPassword(req.user, workspaceId, password);
  }

  @Post('resend-email')
  async resendWelcomeEmail(@Req() req, @Body('workspaceId') workspaceId: string) {
    return await this.sysAdminService.resendWelcomeEmail(req.user, workspaceId);
  }

  @Get('audit-logs')
  async getAuditLogs(@Req() req) {
    return await this.sysAdminService.getAuditLogs(req.user);
  }

  @Post('export')
  async exportWorkspace(@Req() req, @Body('workspaceId') workspaceId: string) {
    return await this.sysAdminService.exportWorkspace(req.user, workspaceId);
  }

  @Post('import')
  async importWorkspace(@Req() req, @Body('workspaceId') workspaceId: string, @Body('importData') importData: string) {
    return await this.sysAdminService.importWorkspace(req.user, workspaceId, importData);
  }
}
