import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SettingsService {
  constructor(private readonly db: DatabaseService) {}

  async getSettings(workspaceId: string) {
    return this.db.client.workspaceSettings.findFirst({ where: { workspaceId } });
  }

  async updateSettings(data: any, workspaceId: string) {
    const existing = await this.db.client.workspaceSettings.findFirst({ where: { workspaceId } });
    if (existing) {
      return this.db.client.workspaceSettings.update({ where: { id: existing.id }, data });
    }
    return this.db.client.workspaceSettings.create({ data: { ...data, workspaceId } });
  }

  async setup(data: any, workspaceId: string) {
    return this.db.client.workspace.update({
      where: { id: workspaceId },
      data: { setupCompleted: true, ...data }
    });
  }
}
