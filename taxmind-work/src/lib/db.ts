import { PrismaClient } from '@prisma/client'

// Lazy Prisma client via JS Proxy (avoids DATABASE_URL at build time)
function makeLazyPrismaClient() {
  let _prisma: PrismaClient | null = null
  return new Proxy({} as PrismaClient, {
    get(_target, prop) {
      if (!_prisma) {
        _prisma = new PrismaClient({
          log: process.env.NODE_ENV === 'development' ? ['query'] : [],
        })
      }
      const value = (_prisma as Record<string | symbol, unknown>)[prop]
      if (typeof value === 'function') {
        return value.bind(_prisma)
      }
      return value
    },
  })
}

export const db = makeLazyPrismaClient()
