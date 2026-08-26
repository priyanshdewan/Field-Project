import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { prisma, checkDbConnection, PrismaClient } from 'bizora-database';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  public client: PrismaClient = this;
  public isConnected = false;

  async onModuleInit() {
    try {
      await this.$connect();
      this.isConnected = true;
      this.logger.log('Successfully connected to Supabase PostgreSQL Database.');
    } catch (err: any) {
      this.isConnected = false;
      this.logger.warn(
        `PostgreSQL connection init notice: ${err.message}. Fallback mode active.`
      );
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.$disconnect();
    }
  }
}
