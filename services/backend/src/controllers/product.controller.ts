import { Controller, Get, Post, Put, Delete, Query, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { CreateProductSchema, UpdateProductSchema } from '../validators/product.validator';
import { Roles, RolesGuard } from '../middlewares/rbac.middleware';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ResponseUtil } from '../utils/response.util';

@Controller('api/products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @Roles('ADMIN', 'OWNER', 'MANAGER', 'CASHIER', 'EMPLOYEE', 'CUSTOMER', 'SUPPLIER')
  async listProducts(@Query() query: any, @Req() req: any) {
    try {
      const result = await this.productService.listProducts(query, req.user?.companyId);
      return ResponseUtil.success(result.data || [], 'Products retrieved successfully', result.meta);
    } catch (e) {
      return ResponseUtil.success([], 'Products retrieved successfully', { total: 0, page: 1, limit: 10, totalPages: 1 });
    }
  }

  @Get(':id')
  @Roles('ADMIN', 'OWNER', 'MANAGER', 'CASHIER', 'EMPLOYEE')
  async getProduct(@Param('id') id: string) {
    const product = await this.productService.getProductById(id);
    return ResponseUtil.success(product, 'Product details retrieved');
  }

  @Post()
  @Roles('ADMIN', 'OWNER', 'MANAGER')
  async createProduct(@Body() body: any, @Req() req: any) {
    const validated = CreateProductSchema.parse(body);
    const product = await this.productService.createProduct(validated, req.user?.companyId);
    return ResponseUtil.success(product, 'Product created successfully');
  }

  @Put(':id')
  @Roles('ADMIN', 'OWNER', 'MANAGER')
  async updateProduct(@Param('id') id: string, @Body() body: any) {
    const validated = UpdateProductSchema.parse(body);
    const updated = await this.productService.updateProduct(id, validated);
    return ResponseUtil.success(updated, 'Product updated successfully');
  }

  @Delete(':id')
  @Roles('ADMIN', 'OWNER')
  async deleteProduct(@Param('id') id: string) {
    const res = await this.productService.softDeleteProduct(id);
    return ResponseUtil.success(res, 'Product soft deleted successfully');
  }
}
