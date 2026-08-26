import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtUtil, JwtPayload } from '../utils/jwt.util';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authentication token missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    const decoded = JwtUtil.verifyAccessToken(token);

    if (!decoded) {
      throw new UnauthorizedException('Token expired or invalid signature');
    }

    req.user = decoded;
    next();
  }
}
