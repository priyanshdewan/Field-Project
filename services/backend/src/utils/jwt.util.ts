const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'bizora_enterprise_super_secret_jwt_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'bizora_enterprise_refresh_jwt_key_2026';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  companyId?: string;
  branchId?: string;
}

export class JwtUtil {
  public static generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
  }

  public static generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  }

  public static verifyAccessToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      return null;
    }
  }

  public static verifyRefreshToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
    } catch {
      return null;
    }
  }
}
