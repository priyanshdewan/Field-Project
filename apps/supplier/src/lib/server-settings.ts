// Bridge module: re-exports from REST API client instead of createServerFn
// This enables static site deployment without server-side rendering

import { getSettingsServer, updateSettingsServer } from './api-settings';

// Re-export with original names that components expect
export const getMallSettingsServer = getSettingsServer;
export const updateMallSettingsServer = updateSettingsServer;
// Also export with api names for any code that uses those
export { getSettingsServer, updateSettingsServer };
