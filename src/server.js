import '../env.js'

import Fastify from 'fastify'
import helmet from '@fastify/helmet'

import prismaPlugin from './plugins/prisma/index.js'
import authPlugin from './plugins/auth/index.js'

import userRoutes from './modules/user/user.route.js'

const fastify = Fastify({
  logger: true
})

fastify.get('/healthcheck', async () => {
  return 'OK'
})

async function setup () {
  await fastify.register(prismaPlugin)
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        'form-action': ["'self'", 'github.com/login', 'accounts.google.com']
      }
    }
  })

  await fastify.register(authPlugin)

  await fastify.register(userRoutes, { prefix: 'api/users' })

  try {
    await fastify.listen({ port: process.env.PORT, host: '0.0.0.0' })
  } catch (error) {
    await fastify.prisma.$disconnect()

    console.error(error)
    process.exit(1)
  }

  console.log('Listening on port: %s', process.env.PORT)
}

setup()
