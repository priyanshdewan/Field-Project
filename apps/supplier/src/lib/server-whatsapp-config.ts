// Bridge module: re-exports from REST API client instead of createServerFn
// This enables static site deployment without server-side rendering

export { getWhatsAppConfigServer, updateWhatsAppConfigServer } from './api-whatsapp-config';

// Type definitions preserved from original server module
export interface WhatsAppConfig {
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioWhatsAppSender: string;
  ownerWhatsAppNumber: string;
  managerWhatsAppNumber: string;
}

// Stub functions for server-only helpers (not needed on static client)
export const readWhatsAppConfig = async (data?: any) => { return []; };
export const writeWhatsAppConfig = async (data?: any) => { return {}; };
