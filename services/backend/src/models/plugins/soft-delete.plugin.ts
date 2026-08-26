import { Schema } from 'mongoose';

export interface SoftDeleteDocument {
  isDeleted?: boolean;
  deletedAt?: Date | null;
}

export function softDeletePlugin(schema: Schema) {
  schema.add({
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  });

  const queryTypes = ['find', 'findOne', 'findOneAndUpdate', 'count', 'countDocuments'];

  queryTypes.forEach((type) => {
    schema.pre(type as any, function (next) {
      const q = this as any;
      if (q.getFilter && q.where) {
        const filter = q.getFilter();
        if (filter && filter.isDeleted === undefined) {
          q.where({ isDeleted: false });
        }
      }
      next();
    });
  });
}
