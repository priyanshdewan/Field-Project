// Stub module: server-only functions replaced with no-ops for static deployment

export interface EmailOptions {
  to: string;
  subject: string;
  body: string; // The HTML body
}

export interface EmailProvider {
  sendEmail(options: EmailOptions): Promise<void>;
}

export const getEmailProvider = async (data?: any) => { return []; };
export const sendSystemEmail = async (data?: any) => { return { success: true }; };
export const EmailTemplates = async (data?: any) => { return {}; };
