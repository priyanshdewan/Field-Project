import { Injectable } from '@nestjs/common';
import { AuditLogModel } from '../models';
import { PaginationUtil, PaginationQuery } from '../utils/pagination.util';

@Injectable()
export class AuditService {
  async logAction(action: string, module: string, userId?: string, email?: string, details?: any) {
    return AuditLogModel.create({
      action,
      module,
      userId,
      userEmail: email,
      details,
    });
  }

  async listAuditLogs(query: PaginationQuery) {
    const { page, limit, skip, sort } = PaginationUtil.parseQueryParams(query);
    const [logs, total] = await Promise.all([
      AuditLogModel.find({}).sort(sort).skip(skip).limit(limit),
      AuditLogModel.countDocuments({}),
    ]);
    return PaginationUtil.formatResult(logs, total, page, limit);
  }
}
