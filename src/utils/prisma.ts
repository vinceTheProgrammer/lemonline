import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '@prisma/client'
let prisma: PrismaClient;

if (!globalThis.prisma) {
  const connectionString = `${process.env.DATABASE_URL}`;
  const adapter = new PrismaBetterSqlite3({ url: connectionString });
  globalThis.prisma = new PrismaClient({ adapter });
}

prisma = globalThis.prisma;
export default prisma