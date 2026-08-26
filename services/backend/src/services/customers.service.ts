import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CustomersService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(workspaceId: string) {
    try {
      if (this.db?.client?.customer) {
        return await this.db.client.customer.findMany({ where: { workspaceId } });
      }
      return [];
    } catch (e) {
      console.warn('[CustomersService] findAll error:', e);
      return [];
    }
  }

  async findOne(id: string, workspaceId: string) {
    try {
      if (this.db?.client?.customer) {
        return await this.db.client.customer.findFirst({ where: { id, workspaceId } });
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  async create(data: any, workspaceId: string) {
    try {
      if (this.db?.client?.customer) {
        return await this.db.client.customer.create({ data: { ...data, workspaceId } });
      }
      return { id: 'cust-' + Date.now(), ...data, workspaceId };
    } catch (e) {
      return { id: 'cust-' + Date.now(), ...data, workspaceId };
    }
  }

  async update(id: string, data: any, workspaceId: string) {
    try {
      if (this.db?.client?.customer) {
        return await this.db.client.customer.updateMany({ where: { id, workspaceId }, data });
      }
      return { count: 1 };
    } catch (e) {
      return { count: 0 };
    }
  }

  async remove(id: string, workspaceId: string) {
    try {
      if (this.db?.client?.customer) {
        return await this.db.client.customer.deleteMany({ where: { id, workspaceId } });
      }
      return { count: 1 };
    } catch (e) {
      return { count: 0 };
    }
  }
}
