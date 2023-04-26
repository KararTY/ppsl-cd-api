import '../env.js'

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'

import Fastify from 'fastify'
import helmet from '@fastify/helmet'
import { withRefResolver } from 'fastify-zod'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'

import prismaPlugin from './plugins/prisma/index.js'
import authPlugin from './plugins/auth/index.js'

import userRoutes from './modules/user/user.route.js'
import { userSchemas } from './modules/user/user.schema.js'

/**
 * @type {import('../package.json')}
 */
const packageJSON = JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), { encoding: 'utf-8' }))

const fastify = Fastify({
  logger: true
})

async function setup () {
  fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        'form-action': ["'self'", 'github.com/login', 'accounts.google.com']
      }
    }
  })

  for (const schema of [...userSchemas]) {
    await fastify.addSchema(schema)
  }

  fastify.register(fastifySwagger, withRefResolver({
    openapi: {
      info: 'PPSL CD API',
      description: 'PPSL CD is a reviews database for companies in relation to the right-to-repair legislation',
      version: packageJSON.version
    }
  }))
  fastify.register(fastifySwaggerUi, {
    routePrefix: '/swagger',
    staticCSP: true
  })

  fastify.get('/healthcheck', async () => {
    return 'OK'
  })

  fastify.register(prismaPlugin)

  fastify.register(authPlugin)

  fastify.register(userRoutes, { prefix: 'api/users' })

  try {
    await fastify.listen({ port: process.env.PORT, host: '0.0.0.0' })
  } catch (error) {
    await fastify.close()
    await fastify.prisma.$disconnect()

    console.error(error)
    process.exit(1)
  }

  console.log('%s@%s ONLINE\nListening on port: %s', packageJSON.name, packageJSON.version, process.env.PORT)
}

setup()
