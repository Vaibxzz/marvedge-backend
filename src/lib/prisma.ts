import { PrismaClient } from '@prisma/client';

// This creates a single, reusable Prisma Client instance.
const prisma = new PrismaClient();

export default prisma;