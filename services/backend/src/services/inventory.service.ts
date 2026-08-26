import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class InventoryService {
  constructor(private readonly db: DatabaseService) {}

  async getStock(workspaceId: string) {
    return this.db.client.inventoryStock.findMany({ where: { workspaceId }, include: { product: true, location: true } });
  }

  async getMovements(workspaceId: string) {
    return this.db.client.inventoryMovement.findMany({ where: { workspaceId }, include: { product: true, location: true } });
  }

  async mutate(data: any, workspaceId: string) {
    const mov = await this.db.client.inventoryMovement.create({
      data: { ...data, workspaceId }
    });
    return mov;
  }

  async getExpiry(workspaceId: string) {
    return this.db.client.productBatch.findMany({
      where: { workspaceId, expiryDate: { not: null } },
      orderBy: { expiryDate: 'asc' },
      take: 50,
      include: { product: true }
    });
  }
}
