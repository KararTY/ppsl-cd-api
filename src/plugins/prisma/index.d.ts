declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}
