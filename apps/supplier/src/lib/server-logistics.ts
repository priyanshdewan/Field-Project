// Bridge module: re-exports from REST API client instead of createServerFn
// This enables static site deployment without server-side rendering

export { getLogisticsDispatchesServer, createLogisticsDispatchServer, updateLogisticsStatusServer } from './api-logistics';

// Type definitions preserved from original server module
export interface DeliveryItem {
  id: string;
  orderNumber: string;
  customerName: string;
  destination: string;
  driverName: string;
  vehicleNumber: string;
  itemsCount: number;
  status: string;
  delayReason?: string | null;
  dispatchedAt: string;
  deliveredAt?: string | null;
}

