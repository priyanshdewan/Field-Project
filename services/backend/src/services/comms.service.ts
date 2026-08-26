import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as fs from 'fs';
import * as path from 'path';

export interface WhatsAppConfig {
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioWhatsAppSender: string;
  ownerWhatsAppNumber: string;
  managerWhatsAppNumber: string;
}

export interface VapiConfig {
  vapiPhoneId: string;
  vapiAgentId: string;
  vapiPublicKey: string;
  vapiPrivateKey: string;
}

@Injectable()
export class CommsService {
  constructor(private prisma: DatabaseService) {}

  private memoryWaConfigCache: WhatsAppConfig = {
    twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || "",
    twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || "",
    twilioWhatsAppSender: process.env.TWILIO_WHATSAPP_SENDER || "whatsapp:+14155238886",
    ownerWhatsAppNumber: process.env.OWNER_WHATSAPP_NUMBER || "+917588021256",
    managerWhatsAppNumber: process.env.MANAGER_WHATSAPP_NUMBER || "+917588021256",
  };

  private memoryVapiConfigCache: VapiConfig = {
    vapiPhoneId: process.env.VAPI_PHONE_ID || "027dfd39-b626-43cf-859f-6583a33f580b",
    vapiAgentId: process.env.VAPI_AGENT_ID || "88b76de6-b66b-46f0-a536-8182804fab8a",
    vapiPublicKey: process.env.VAPI_PUBLIC_KEY || "e3322c27-c9ac-45cb-9c58-e49c8f423a1f",
    vapiPrivateKey: process.env.VAPI_PRIVATE_KEY || "581c84cb-6185-4714-98d1-bdd823189ea0",
  };

  private getWaConfigPath() {
    return path.join(process.cwd(), 'whatsapp-config.json');
  }

  private getVapiConfigPath() {
    return path.join(process.cwd(), 'vapi-config.json');
  }

  async getWhatsAppConfig() {
    try {
      const configPath = this.getWaConfigPath();
      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, 'utf8');
        const parsed = JSON.parse(raw);
        this.memoryWaConfigCache = { ...this.memoryWaConfigCache, ...parsed };
      }
    } catch (err) {}
    return { success: true, data: this.memoryWaConfigCache };
  }

  async updateWhatsAppConfig(config: WhatsAppConfig) {
    this.memoryWaConfigCache = { ...this.memoryWaConfigCache, ...config };
    try {
      const configPath = this.getWaConfigPath();
      fs.writeFileSync(configPath, JSON.stringify(this.memoryWaConfigCache, null, 2), 'utf8');
    } catch (err) {}
    return { success: true, data: this.memoryWaConfigCache };
  }

  async sendWhatsAppMessage(data: { recipientPhone: string; recipientName?: string; message: string; workspaceId?: string }) {
    const config = this.memoryWaConfigCache;
    let phone = (data.recipientPhone || config.ownerWhatsAppNumber || "").trim().replace(/\s+/g, "");
    if (!phone.startsWith("+")) {
      if (phone.length === 10) phone = "+91" + phone;
      else phone = "+" + phone;
    }

    console.log("[WhatsApp Debug] Config loaded:", {
      hasSid: !!config.twilioAccountSid,
      hasToken: !!config.twilioAuthToken,
      sender: config.twilioWhatsAppSender,
      recipientPhone: phone,
    });

    let logId = "";
    try {
      const log = await this.prisma.messageLog.create({
        data: {
          workspaceId: data.workspaceId || "grandsquare-mall",
          channel: "WHATSAPP",
          recipientName: data.recipientName || "WhatsApp Recipient",
          recipientPhone: phone,
          messageType: "OUTREACH",
          body: data.message,
          status: "PENDING",
        },
      });
      logId = log.id;
    } catch (err) {}

    // Live Twilio WhatsApp API integration if Account SID & Auth Token are provided
    if (config.twilioAccountSid && config.twilioAuthToken) {
      try {
        const auth = Buffer.from(`${config.twilioAccountSid}:${config.twilioAuthToken}`).toString('base64');
        
        // Ensure the sender has 'whatsapp:' prefix
        let fromNumber = config.twilioWhatsAppSender || "whatsapp:+14155238886";
        if (!fromNumber.startsWith("whatsapp:")) {
          fromNumber = `whatsapp:${fromNumber}`;
        }
        
        // Ensure the recipient has 'whatsapp:' prefix
        const toNumber = `whatsapp:${phone}`;
        
        console.log("[WhatsApp Debug] Sending via Twilio:", { from: fromNumber, to: toNumber, bodyLength: data.message.length });

        const bodyParams = new URLSearchParams({
          From: fromNumber,
          To: toNumber,
          Body: data.message,
        });

        const twilioRes = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${config.twilioAccountSid}/Messages.json`,
          {
            method: "POST",
            headers: {
              "Authorization": `Basic ${auth}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: bodyParams.toString(),
          }
        );

        const twilioData: any = await twilioRes.json();
        console.log("[WhatsApp Debug] Twilio Response:", { ok: twilioRes.ok, status: twilioRes.status, data: twilioData });
        
        if (logId) {
          await this.prisma.messageLog.update({
            where: { id: logId },
            data: {
              status: twilioRes.ok ? "SENT" : "FAILED",
              providerId: twilioData.sid || "wa-msg-" + Date.now(),
            },
          });
        }

        if (!twilioRes.ok) {
          return { 
            success: false, 
            error: twilioData.message || `Twilio API returned HTTP ${twilioRes.status}`,
            errorCode: twilioData.code,
            data: twilioData, 
            recipientPhone: phone 
          };
        }

        return { success: true, data: twilioData, recipientPhone: phone };
      } catch (err: any) {
        console.error("[Twilio WhatsApp Error]:", err);
        if (logId) {
          try {
            await this.prisma.messageLog.update({
              where: { id: logId },
              data: { status: "FAILED" },
            });
          } catch (e) {}
        }
        return {
          success: false,
          error: err?.message || "Twilio API network error",
          data: { phone, status: "FAILED" },
        };
      }
    }

    // No Twilio credentials configured — return honest status
    if (logId) {
      try {
        await this.prisma.messageLog.update({
          where: { id: logId },
          data: { status: "NO_CREDENTIALS", providerId: "wa-msg-" + Date.now() },
        });
      } catch (e) {}
    }

    return {
      success: false,
      message: `WhatsApp API credentials not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables, or use the direct wa.me link to send messages manually.`,
      data: { phone, status: "NO_CREDENTIALS", messageId: "wa-msg-" + Date.now() },
    };
  }

  async getVapiConfig() {
    try {
      const configPath = this.getVapiConfigPath();
      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, 'utf8');
        const parsed = JSON.parse(raw);
        this.memoryVapiConfigCache = { ...this.memoryVapiConfigCache, ...parsed };
      }
    } catch (err) {}
    return { success: true, data: this.memoryVapiConfigCache };
  }

  async updateVapiConfig(config: VapiConfig) {
    this.memoryVapiConfigCache = { ...this.memoryVapiConfigCache, ...config };
    try {
      const configPath = this.getVapiConfigPath();
      fs.writeFileSync(configPath, JSON.stringify(this.memoryVapiConfigCache, null, 2), 'utf8');
    } catch (err) {}
    return { success: true, data: this.memoryVapiConfigCache };
  }

  async initiateVapiCall(workspaceId: string, data: any) {
    const config = this.memoryVapiConfigCache;

    let phone = (data.phoneNumber || data.recipientPhone || "").trim().replace(/\s+/g, "");
    if (!phone.startsWith("+")) {
      if (phone.length === 10) phone = "+91" + phone;
      else phone = "+" + phone;
    }

    const recipientName = data.recipientName || "Aapka Business Partner";
    const contextMsg = data.messageContext || data.script || "Bizora AI se aap ke liye important update hai.";

    let logId = "";
    try {
      const log = await this.prisma.messageLog.create({
        data: {
          workspaceId,
          channel: "VOICE",
          recipientName,
          recipientPhone: phone,
          messageType: "CRM_OUTREACH",
          body: contextMsg,
          status: "PENDING",
        },
      });
      logId = log.id;
    } catch (dbErr) {}

    // Dispatch real outbound phone call via Vapi REST API with HD trained voice & noise cancellation
    try {
      // Build trained inline assistant config with noise suppression and calibrated natural speech
      const vapiPayload: any = {
        phoneNumberId: config.vapiPhoneId,
        customer: {
          number: phone,
          name: recipientName,
        },
        assistant: {
          name: "Bizora AI Trained Voice Agent",
          transcriber: {
            provider: "deepgram",
            model: "nova-2",
            language: "hi",
            smartFormat: true,
            backgroundDenoisingEnabled: true,
          },
          model: {
            provider: "openai",
            model: "gpt-4o-mini",
            temperature: 0.3,
            messages: [
              {
                role: "system",
                content: `You are a warm, polite, and articulate Hindi-speaking AI Business Assistant for GrandSquare Supermart powered by Bizora AI. You are calling ${recipientName}.

TRAINED SPEECH & VOICE CLARITY GUIDELINES:
1. PRIMARY MESSAGE TO DELIVER: "${contextMsg}".
2. SPEECH PACING: Speak clearly, calmly, and at a steady, natural human speed (0.9x). Use short, well-punctuated sentences with pauses so your voice sounds 100% natural, clear, and unhurried.
3. NOISE & DISTURBANCE CONTROL: Do not stutter, rush, or repeat phrases. Eliminate awkward pauses. Keep answers polite and 1-2 sentences maximum.
4. LANGUAGE: Always speak in respectful Hindi or natural Hinglish (e.g. "Namaste ${recipientName} ji! Main GrandSquare Supermart se Bizora AI assistant bol rahi hoon.").
5. POLITENESS: Use respectful Indian honorifics ("ji", "Aapka dhanyavaad", "Aapka din shubh ho").`,
              },
            ],
          },
          voice: {
            provider: "azure",
            voiceId: "hi-IN-SwaraNeural",
            speed: 0.92,
            style: "customerservice",
          },
          backgroundDenoisingEnabled: true,
          responseDelaySeconds: 0.4,
          numWordsToInterrupt: 3,
          firstMessage: `Namaste ${recipientName} ji! Main GrandSquare Supermart se Bizora AI assistant bol rahi hoon. ${contextMsg}`,
          endCallMessage: `Dhanyavaad ${recipientName} ji! Aapka din shubh ho. GrandSquare Supermart mein aapka swagat hai.`,
        },
      };

      const vapiResponse = await fetch("https://api.vapi.ai/call/phone", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${config.vapiPrivateKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vapiPayload),
      });

      const resData: any = await vapiResponse.json();

      if (logId) {
        await this.prisma.messageLog.update({
          where: { id: logId },
          data: {
            status: vapiResponse.ok ? "SENT" : "FAILED",
            providerId: resData.id || "vapi-call-" + Date.now(),
          },
        });
      }

      return {
        success: vapiResponse.ok,
        data: {
          callId: resData.id || "vapi-call-" + Date.now(),
          status: resData.status || (vapiResponse.ok ? "queued" : "failed"),
          firstMessage: contextMsg,
          details: resData,
        },
      };
    } catch (err: any) {
      console.error("[Vapi API Call Error]:", err);
      if (logId) {
        try {
          await this.prisma.messageLog.update({
            where: { id: logId },
            data: { status: "FAILED" },
          });
        } catch (e) {}
      }

      return {
        success: false,
        error: err?.message || "Failed to dispatch Vapi AI voice call",
      };
    }
  }

  async getMessageLogs(workspaceId: string) {
    try {
      const logs = await this.prisma.messageLog.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      return { success: true, data: logs };
    } catch (err) {
      return { success: true, data: [] };
    }
  }
}
