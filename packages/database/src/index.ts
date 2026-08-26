import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

export async function checkDbConnection(): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    return false;
  }
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (e) {
    console.warn("Database connection failed:", e);
    return false;
  }
}

export * from "@prisma/client";
