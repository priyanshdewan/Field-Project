import { Controller, Post, Body, Req } from '@nestjs/common';
import { AiService } from '../services/ai.service';

@Controller('api/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('ask')
  async askAi(@Req() req, @Body() body: any) {
    const user = req.user;
    const query = typeof body === 'string' ? body : (body?.query || '');
    return await this.aiService.askAi(user?.workspaceId || 'grandsquare-mall', query, body);
  }
}
