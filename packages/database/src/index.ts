import { prismaAdapter } from "@better-auth/prisma-adapter";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

export interface DatabaseConnection {
  readonly authAdapter: ReturnType<typeof prismaAdapter>;
  close(): Promise<void>;
}

export function createDatabase(connectionString: string): DatabaseConnection {
  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  return {
    authAdapter: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    async close() {
      await prisma.$disconnect();
    },
  };
}
