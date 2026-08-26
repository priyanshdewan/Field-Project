import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductModel } from '../models';
import { PaginationUtil, PaginationQuery } from '../utils/pagination.util';

@Injectable()
export class ProductService {
  async listProducts(query: PaginationQuery, companyId?: string) {
    const { page, limit, skip, sort, search } = PaginationUtil.parseQueryParams(query);

    const filter: any = {};
    if (companyId) {
      filter.companyId = companyId;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      ProductModel.find(filter).sort(sort).skip(skip).limit(limit),
      ProductModel.countDocuments(filter),
    ]);

    return PaginationUtil.formatResult(items, total, page, limit);
  }

  async getProductById(id: string) {
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async createProduct(data: any, companyId?: string) {
    return ProductModel.create({ ...data, companyId });
  }

  async updateProduct(id: string, data: any) {
    const updated = await ProductModel.findByIdAndUpdate(id, { $set: data }, { new: true });
    if (!updated) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return updated;
  }

  async softDeleteProduct(id: string) {
    const deleted = await ProductModel.findByIdAndUpdate(
      id,
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );
    if (!deleted) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return { success: true, message: 'Product soft-deleted successfully' };
  }
}
