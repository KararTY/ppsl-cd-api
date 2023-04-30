import fp from 'fastify-plugin'
import { fastifyNextAuth } from 'fastify-next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'

import { Google } from './providers/google.js'
import { GitHub } from './providers/github.js'

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function authenticate (request, reply, next) {
  const session = await request.server.getSession(request)

  if (!session?.user) {
    const error = new Error()
    error.statusCode = 401
    return error
  }

  request.session = session
}

/**
 * @type {import('fastify').FastifyPluginAsync}
 */
const authPlugin = fp(async (fastify, _) => {
  await fastify.register(fastifyNextAuth, {
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    providers: [Google, GitHub],
    adapter: PrismaAdapter(fastify.prisma),
    callbacks: {
      async session ({ session, token, user }) {
        if (session.user) {
          session.user.id = user.id
        }

        return session
      }
    }
  })

  await fastify.decorate('authenticate', authenticate)
})

export default authPlugin
