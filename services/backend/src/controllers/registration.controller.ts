import { Controller, Post, Body } from '@nestjs/common';
import { SystemAdminService } from '../services/system-admin.service';

@Controller('api/registration')
export class RegistrationController {
  constructor(private readonly sysAdminService: SystemAdminService) {}

  @Post('register')
  async registerCompany(@Body() body: any) {
    return await this.sysAdminService.registerCompany(body);
  }
}
