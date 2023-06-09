import fp from 'fastify-plugin'
import { PrismaClient } from '../../../.prisma/client/index.js' // Generated with prisma:generate

/**
 * @type {import('fastify').FastifyPluginAsync} Prisma Fastify Plugin
 */
const prismaPlugin = fp(async (fastify, _) => {
  const prisma = new PrismaClient()

  await prisma.$connect()
  fastify.log.info('Prisma connected.')

  // Make Prisma Client available through the fastify instance: fastify.prisma
  fastify.decorate('prisma', prisma)

  fastify.addHook('onClose', async (fastify) => {
    await fastify.prisma.$disconnect()
    fastify.log.info('Prisma disconnected.')
  })
})

export default prismaPlugin
