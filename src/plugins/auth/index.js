import fp from 'fastify-plugin'
import Middie from '@fastify/middie/engine.js'
import helmet from 'helmet'
import { createAuthMiddleware, getSession } from 'authey'
import { PrismaAdapter } from '@next-auth/prisma-adapter'

import { createDefaultBioPost } from '../../modules/bio/bio.service.js'

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
const authPlugin = fp(async (fastify, opts) => {
  const { helmetOpts } = opts

  /**
   * @type {import('@auth/core').AuthConfig}
   */
  const options = {
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
    },
    events: {
      createUser: async ({ user }) => {
        createDefaultBioPost(fastify.prisma, user)
      }
    }
  }

  const middleware = createAuthMiddleware(options)
  const middie = Middie((err, _, __, next) => {
    next(err)
  })

  middie.use(helmet(helmetOpts))
  middie.use(middleware)

  function runMiddie (req, reply, next2) {
    req.raw.originalUrl = req.raw.url
    req.raw.id = req.id
    req.raw.hostname = req.hostname
    req.raw.ip = req.ip
    req.raw.ips = req.ips
    req.raw.log = req.log
    req.raw.body = req.body
    req.raw.query = req.query
    // reply.raw.log = req.log;
    middie.run(req.raw, reply.raw, next2)
  }

  fastify.addHook('onRequest', runMiddie)

  fastify.decorate('getSession', function (req) {
    return getSession(req.raw, options)
  })

  fastify.decorate('authenticate', authenticate)
})

export default authPlugin
