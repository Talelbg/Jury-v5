// lib/prisma.ts

import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient | null = null;

const getPrismaClient = () => {
    if (prisma === null) {
        prisma = new PrismaClient();
        prisma.$connect();
        // Handle connection errors
        prisma.$on('error', (e) => {
            console.error('Prisma Client Error:', e);
        });
    }
    return prisma;
};

export { getPrismaClient };