const fs = require('fs');
const path = require('path');

const backendDir = 'd:\\omni-mind-vue-main\\services\\backend\\src';
const controllersDir = path.join(backendDir, 'controllers');
const servicesDir = path.join(backendDir, 'services');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

ensureDir(controllersDir);
ensureDir(servicesDir);

// Helpers
const ctrlTpl = (name, routes) => `import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ${name}Service } from '../services/${name.toLowerCase()}.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('api/${name.toLowerCase()}')
export class ${name}Controller {
  constructor(private readonly service: ${name}Service) {}

${routes}
}
`;

const srvTpl = (name, methods) => `import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ${name}Service {
  constructor(private readonly db: DatabaseService) {}

${methods}
}
`;

const files = {
  'customers': {
    routes: `
  @Get()
  async findAll(@Req() req: any) {
    const data = await this.service.findAll(req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const data = await this.service.findOne(id, req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    const data = await this.service.create(body, req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const data = await this.service.update(id, body, req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const data = await this.service.remove(id, req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }`,
    methods: `
  async findAll(workspaceId: string) {
    return this.db.client.customer.findMany({ where: { workspaceId } });
  }

  async findOne(id: string, workspaceId: string) {
    return this.db.client.customer.findFirst({ where: { id, workspaceId } });
  }

  async create(data: any, workspaceId: string) {
    return this.db.client.customer.create({
      data: { ...data, workspaceId }
    });
  }

  async update(id: string, data: any, workspaceId: string) {
    return this.db.client.customer.update({
      where: { id_workspaceId: { id, workspaceId } },
      data
    }).catch(() => this.db.client.customer.updateMany({ where: { id, workspaceId }, data }));
  }

  async remove(id: string, workspaceId: string) {
    return this.db.client.customer.deleteMany({ where: { id, workspaceId } });
  }`
  },
  'suppliers': {
    routes: `
  @Get()
  async findAll(@Req() req: any) {
    const data = await this.service.findAll(req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    const data = await this.service.create(body, req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const data = await this.service.update(id, body, req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const data = await this.service.remove(id, req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Get('purchase-orders')
  async getOrders(@Req() req: any) {
    const data = await this.service.getOrders(req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Post('purchase-orders')
  async createOrder(@Body() body: any, @Req() req: any) {
    const data = await this.service.createOrder({ ...body, createdBy: req.user.userId }, req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Get('purchase-orders/:id')
  async getOrder(@Param('id') id: string, @Req() req: any) {
    const data = await this.service.getOrder(id, req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Put('purchase-orders/:id/status')
  async updateOrderStatus(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const data = await this.service.updateOrderStatus(id, body.status, req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Post('purchase-orders/:id/receive')
  async receiveOrder(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const data = await this.service.receiveOrder(id, body, req.user.userId, req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }`,
    methods: `
  async findAll(workspaceId: string) {
    return this.db.client.supplier.findMany({ where: { workspaceId } });
  }

  async create(data: any, workspaceId: string) {
    return this.db.client.supplier.create({ data: { ...data, workspaceId } });
  }

  async update(id: string, data: any, workspaceId: string) {
    return this.db.client.supplier.updateMany({ where: { id, workspaceId }, data });
  }

  async remove(id: string, workspaceId: string) {
    return this.db.client.supplier.deleteMany({ where: { id, workspaceId } });
  }

  async getOrders(workspaceId: string) {
    return this.db.client.purchaseOrder.findMany({ where: { workspaceId }, include: { supplier: true, items: true } });
  }

  async getOrder(id: string, workspaceId: string) {
    return this.db.client.purchaseOrder.findFirst({ where: { id, workspaceId }, include: { items: true, supplier: true } });
  }

  async createOrder(data: any, workspaceId: string) {
    const { items, ...poData } = data;
    return this.db.client.purchaseOrder.create({
      data: {
        ...poData,
        workspaceId,
        items: {
          create: items.map((i: any) => ({ ...i, workspaceId }))
        }
      }
    });
  }

  async updateOrderStatus(id: string, status: string, workspaceId: string) {
    return this.db.client.purchaseOrder.updateMany({ where: { id, workspaceId }, data: { status } });
  }

  async receiveOrder(id: string, data: any, userId: string, workspaceId: string) {
    return this.db.client.goodsReceipt.create({
      data: {
        purchaseOrderId: id,
        receivedBy: userId,
        notes: data.notes,
        workspaceId,
        items: {
          create: data.items.map((i: any) => ({ ...i, workspaceId }))
        }
      }
    });
  }`
  },
  'staff': {
    routes: `
  @Get()
  async findAll(@Req() req: any) {
    const data = await this.service.findAll(req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    const data = await this.service.create(body, req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const data = await this.service.update(id, body, req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    const data = await this.service.remove(id, req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }`,
    methods: `
  async findAll(workspaceId: string) {
    return this.db.client.staff.findMany({ where: { workspaceId } });
  }

  async create(data: any, workspaceId: string) {
    return this.db.client.staff.create({ data: { ...data, workspaceId } });
  }

  async update(id: string, data: any, workspaceId: string) {
    return this.db.client.staff.updateMany({ where: { id, workspaceId }, data });
  }

  async remove(id: string, workspaceId: string) {
    return this.db.client.staff.deleteMany({ where: { id, workspaceId } });
  }`
  },
  'settings': {
    routes: `
  @Get()
  async getSettings(@Req() req: any) {
    const data = await this.service.getSettings(req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Put()
  async updateSettings(@Body() body: any, @Req() req: any) {
    const data = await this.service.updateSettings(body, req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Post('setup')
  async setup(@Body() body: any, @Req() req: any) {
    const data = await this.service.setup(body, req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }`,
    methods: `
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
  }`
  },
  'inventory': {
    routes: `
  @Get('stock')
  async getStock(@Req() req: any) {
    const data = await this.service.getStock(req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Get('movements')
  async getMovements(@Req() req: any) {
    const data = await this.service.getMovements(req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Post('mutate')
  async mutate(@Body() body: any, @Req() req: any) {
    const data = await this.service.mutate({ ...body, performedBy: req.user.userId }, req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }

  @Get('expiry')
  async getExpiry(@Req() req: any) {
    const data = await this.service.getExpiry(req.user.companyId || req.user.workspaceId);
    return { success: true, data };
  }`,
    methods: `
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
    // Normally you'd also update InventoryStock here
    return mov;
  }

  async getExpiry(workspaceId: string) {
    return this.db.client.productBatch.findMany({
      where: { workspaceId, expiryDate: { not: null } },
      orderBy: { expiryDate: 'asc' },
      take: 50,
      include: { product: true }
    });
  }`
  }
};

for (const [name, conf] of Object.entries(files)) {
  const Name = name.charAt(0).toUpperCase() + name.slice(1);
  fs.writeFileSync(path.join(controllersDir, \`\${name}.controller.ts\`), ctrlTpl(Name, conf.routes));
  fs.writeFileSync(path.join(servicesDir, \`\${name}.service.ts\`), srvTpl(Name, conf.methods));
}

console.log("Generated controllers and services");
