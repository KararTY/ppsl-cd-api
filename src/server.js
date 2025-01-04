#!/usr/bin/env node
import './env.js'

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'

import Fastify from 'fastify'
import { withRefResolver } from 'fastify-zod'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'

import prismaPlugin from './plugins/prisma/index.js'
import authPlugin from './plugins/auth/index.js'

import schemas from './schemas.js'
import routes from './routes.js'

const envToLogger = {
  development: {
    transport: {
      target: 'pino-pretty'
    }
  },
  production: true,
  test: false
}

/**
 * @type {import('../package.json')}
 */
const packageJSON = JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), { encoding: 'utf-8' }))

/**
 * @type {import('helmet').HelmetOptions}
 */
const helmetOpts = {
  contentSecurityPolicy: {
    directives: {
      'form-action': ["'self'", 'github.com/login', 'accounts.google.com']
    }
  }
}

async function setup () {
  const fastify = Fastify({
    logger: envToLogger[process.env.NODE_ENV] ?? true
  })

  // Schemas first.
  await fastify.register(schemas)

  // For db access via fastify.prisma
  await fastify.register(prismaPlugin)

  // Adds authentication routes through Auth.js
  fastify.register(authPlugin, { helmetOpts })

  // Swagger
  fastify.register(fastifySwagger, withRefResolver({
    openapi: {
      info: 'PPSL CD API',
      description: 'PPSL CD is a company reviews database, for consumers, in relation to the right-to-repair legislation.',
      version: packageJSON.version
    }
  }))
  fastify.register(fastifySwaggerUi, {
    routePrefix: '/swagger',
    staticCSP: true
  })

  // Routes
  fastify.register(routes)

  try {
    await fastify.listen({ port: process.env.PORT, host: process.env.HOST || '0.0.0.0' })
  } catch (error) {
    await fastify.close()

    fastify.log.fatal(error)
    process.exit(1)
  }

  fastify.log.info('%s@%s ONLINE', packageJSON.name, packageJSON.version)

  const { address, port } = fastify.server.address()
  fastify.log.info('Swagger at http://%s:%s/swagger', address, port)
}

setup()
