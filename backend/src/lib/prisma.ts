import { PrismaClient } from "@prisma/client";

// Una sola instancia de PrismaClient para toda la app
export const prisma = new PrismaClient();
