import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DatabaseConfig } from './config/database';
import { setupSecurityMiddleware } from './middlewares/security.middleware';
import { CentralExceptionFilter } from './middlewares/error.middleware';

async function bootstrap() {
  // Connect Mongoose to MongoDB
  await DatabaseConfig.connect();

  const app = await NestFactory.create(AppModule);

  // Security headers, CORS, and Rate Limiting
  setupSecurityMiddleware(app);

  // Centralized Error Exception Filter
  app.useGlobalFilters(new CentralExceptionFilter());

  const port = process.env.PORT || process.env.BACKEND_PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`[Bizora OS] Enterprise Backend running on 0.0.0.0:${port}`);
}

bootstrap().catch((err) => {
  console.error('[Bizora OS] Fatal error during backend bootstrap:', err);
  process.exit(1);
});
