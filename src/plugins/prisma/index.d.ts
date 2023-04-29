import { PrismaClient } from '../../../.prisma/client' // Generated with prisma:generate

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}
