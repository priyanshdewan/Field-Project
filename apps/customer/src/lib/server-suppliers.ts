// Bridge module: re-exports from REST API client instead of createServerFn
// This enables static site deployment without server-side rendering

import {
  getSuppliersServer,
  addSupplierServer,
  editSupplierServer,
  archiveSupplierServer,
  getPurchaseOrdersServer,
  createPurchaseOrderServer,
  updatePurchaseOrderStatusServer,
} from './api-suppliers';

// Re-export with original names that components expect (without Server suffix)
export const getSuppliers = getSuppliersServer;
export const addSupplier = addSupplierServer;
export const getPurchaseOrders = getPurchaseOrdersServer;
export const createPurchaseOrder = createPurchaseOrderServer;

// Re-export with Server suffix names too
export {
  getSuppliersServer,
  addSupplierServer,
  editSupplierServer,
  archiveSupplierServer,
  getPurchaseOrdersServer,
  createPurchaseOrderServer,
  updatePurchaseOrderStatusServer,
};

// Stub for functions that were server-only
export const getPurchaseOrderDetailsServer = async (data?: any) => { return {}; };
export const receivePurchaseOrderGoodsServer = async (data?: any) => { return { success: true }; };
