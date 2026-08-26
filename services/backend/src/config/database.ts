import mongoose from 'mongoose';

export class DatabaseConfig {
  private static isConnected = false;

  public static async connect(): Promise<typeof mongoose | null> {
    if (this.isConnected) {
      return mongoose;
    }

    const uri = process.env.MONGODB_URI;
    if (!uri || uri.includes('placeholder') || uri.includes('YOUR-') || (process.env.NODE_ENV === 'production' && uri.includes('localhost'))) {
      console.warn('[MongoDB] MONGODB_URI is absent, unconfigured, or set to localhost in production. Running in offline mock mode.');
      return null;
    }

    try {
      mongoose.set('strictQuery', true);
      const db = await mongoose.connect(uri, {
        autoIndex: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      this.isConnected = true;
      console.log('[MongoDB] Connection established successfully.');

      mongoose.connection.on('error', (err) => {
        console.error('[MongoDB] Connection error:', err);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('[MongoDB] Disconnected from database server.');
        this.isConnected = false;
      });

      return db;
    } catch (error) {
      console.error('[MongoDB] Failed to connect:', error);
      this.isConnected = false;
      return null;
    }
  }

  public static getStatus(): boolean {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}
