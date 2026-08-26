import { z } from 'zod';

export const RegisterUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  role: z.enum(['ADMIN', 'OWNER', 'MANAGER', 'CASHIER', 'SUPPLIER', 'CUSTOMER', 'EMPLOYEE']).optional(),
  companyName: z.string().optional(),
});

export const LoginUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});
