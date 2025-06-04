// Configurações de conexão prisma

import { PrismaClient } from '@prisma/client'   

export const prisma = new PrismaClient({
    // Se o ambiente for de produção, não exibe os logs de query, caso ao contrário, exibe
    log: process.env.NODE_ENV === "production" ? [] : ["query"]
})