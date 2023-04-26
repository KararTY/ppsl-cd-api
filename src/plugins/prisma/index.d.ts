import { PrismaClient } from '../../../.prisma/client' // Generated with prisma:generate

// Use TypeScript module augmentation to declare the type of fastify.prisma to be PrismaClient
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}
