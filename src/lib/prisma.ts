import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;

if (globalForPrisma.prisma) {
  prisma = globalForPrisma.prisma;
} else {
  // Check if we are running in the browser
  if (typeof window === 'undefined') {
    const adapter = new PrismaPg({ connectionString: process.env.POSTGRES_PRISMA_URL! });
    prisma = new PrismaClient({ adapter, log: ['query'] });
  } else {
    // This is just a fallback for types if accidentally imported on client
    prisma = new PrismaClient();
  }
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { prisma };
