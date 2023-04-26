import fp from 'fastify-plugin'
import { fastifyNextAuth } from 'fastify-next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'

import { Google } from './providers/google.js'
import { GitHub } from './providers/github.js'

/**
  * @param {import("fastify").FastifyRequest} request
  * @param {import("fastify").FastifyReply} reply
  */
export async function authenticate (request, reply, next) {
  const session = await request.server.getSession(request)

  if (!session?.user) {
    const error = new Error()
    error.statusCode = 401
    next(error)
  }

  request.session = session
  next()
}

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

  await fastify.decorate('authenticate', authenticate)
})

export default authPlugin
