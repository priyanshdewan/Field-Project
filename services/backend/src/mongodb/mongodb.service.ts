import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { MongoClient } from 'mongodb';

@Injectable()
export class MongodbService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MongodbService.name);
  private client: MongoClient | null = null;
  public isConnected = false;

  async onModuleInit() {
    const uri = process.env.MONGODB_URI;
    if (!uri || uri.includes("placeholder") || uri.includes("YOUR-") || (process.env.NODE_ENV === 'production' && uri.includes('localhost'))) {
      this.logger.warn('MONGODB_URI is not set, placeholder, or localhost in production. AI/Audit logs will run in mock mode.');
      return;
    }

    try {
      this.client = new MongoClient(uri, {
        connectTimeoutMS: 5000,
        socketTimeoutMS: 5000,
      });
      await this.client.connect();
      this.isConnected = true;
      this.logger.log('Successfully connected to MongoDB Database.');
    } catch (error) {
      this.logger.error('Failed to connect to MongoDB Database, fallback to mock mode:', error);
      this.client = null;
      this.isConnected = false;
    }
  }

  async onModuleDestroy() {
    if (this.client && this.isConnected) {
      await this.client.close();
    }
  }

  async logAiInteraction(data: {
    workspaceId: string;
    userId: string;
    query: string;
    intent: string;
    response: any;
  }) {
    const interaction = { ...data, timestamp: new Date() };
    if (this.client && this.isConnected) {
      try {
        const db = this.client.db('bizora');
        await db.collection('ai_logs').insertOne(interaction);
      } catch (e) {
        this.logger.error('Failed to log AI interaction to MongoDB:', e);
      }
    } else {
      this.logger.log(`[Mock MongoDB AI Log] ${JSON.stringify(interaction)}`);
    }
  }

  async logWhatsAppAudit(data: {
    workspaceId: string;
    phoneNumber: string;
    direction: 'incoming' | 'outgoing';
    messageText: string;
    status: string;
  }) {
    const logEntry = { ...data, timestamp: new Date() };
    if (this.client && this.isConnected) {
      try {
        const db = this.client.db('bizora');
        await db.collection('whatsapp_logs').insertOne(logEntry);
      } catch (e) {
        this.logger.error('Failed to log WhatsApp audit to MongoDB:', e);
      }
    } else {
      this.logger.log(`[Mock MongoDB WhatsApp Log] ${JSON.stringify(logEntry)}`);
    }
  }
}
