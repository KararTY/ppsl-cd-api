import fp from 'fastify-plugin'
import { fastifyNextAuth } from 'fastify-next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'

import { Google } from './providers/google.js'
import { GitHub } from './providers/github.js'

/**
 * @type {import('fastify').FastifyPluginAsync}
 */
const authPlugin = fp(async (fastify, _) => {
  await fastify.register(fastifyNextAuth, {
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    providers: [Google, GitHub],
    adapter: PrismaAdapter(fastify.prisma)
  })
})

export default authPlugin
