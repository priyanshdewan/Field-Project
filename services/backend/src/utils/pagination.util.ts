export interface PaginationQuery {
  page?: number | string;
  limit?: number | string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  [key: string]: any;
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class PaginationUtil {
  public static parseQueryParams(query: PaginationQuery) {
    const page = Math.max(1, parseInt(String(query.page || 1), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || 20), 10)));
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder: 'asc' | 'desc' = query.sortOrder === 'asc' ? 'asc' : 'desc';

    return { page, limit, skip, sort: { [sortBy]: sortOrder } as any, search: query.search || '' };
  }

  public static formatResult<T>(data: T[], total: number, page: number, limit: number): PaginationResult<T> {
    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}
