import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";
import path from "path";

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL || "file:./dev.db";
  if (url.startsWith("file:./")) {
    const filePath = path.join(process.cwd(), "prisma", url.replace("file:./", ""));
    return `file:${filePath}`;
  }
  return url;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = getDatabaseUrl();
  const authToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN;
  const adapter = new PrismaLibSql(
    authToken ? { url, authToken } : { url }
  );
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
