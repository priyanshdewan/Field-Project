import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class StaffService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(workspaceId: string) {
    try {
      if (this.db?.client?.staff) {
        return await this.db.client.staff.findMany({ where: { workspaceId } });
      }
      return [];
    } catch (e) {
      console.warn('[StaffService] findAll error:', e);
      return [];
    }
  }

  async create(data: any, workspaceId: string) {
    try {
      if (this.db?.client?.staff) {
        return await this.db.client.staff.create({ data: { ...data, workspaceId } });
      }
      return { id: 'stf-' + Date.now(), ...data, workspaceId };
    } catch (e) {
      return { id: 'stf-' + Date.now(), ...data, workspaceId };
    }
  }

  async update(id: string, data: any, workspaceId: string) {
    try {
      if (this.db?.client?.staff) {
        return await this.db.client.staff.updateMany({ where: { id, workspaceId }, data });
      }
      return { count: 1 };
    } catch (e) {
      return { count: 0 };
    }
  }

  async remove(id: string, workspaceId: string) {
    try {
      if (this.db?.client?.staff) {
        return await this.db.client.staff.deleteMany({ where: { id, workspaceId } });
      }
      return { count: 1 };
    } catch (e) {
      return { count: 0 };
    }
  }
}
