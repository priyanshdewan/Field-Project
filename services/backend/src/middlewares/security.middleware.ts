import { INestApplication } from '@nestjs/common';
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

export function setupSecurityMiddleware(app: INestApplication) {
  // Helmet HTTP Header security
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );

  // Global Rate Limiter: 5000 requests per 15 mins (Generous for dashboard polling)
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: 'Too many requests from this IP. Please try again after 15 minutes.',
    },
  });

  app.use(limiter);
}
