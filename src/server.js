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

import userRoutes from './modules/user/user.route.js'
import { userSchemas } from './modules/user/user.schema.js'
import postRoutes from './modules/post/post.route.js'
import { postSchemas } from './modules/post/post.schema.js'

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

const helmetOpts = {
  global: true,
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

  for (const schema of [...userSchemas, ...postSchemas]) {
    await fastify.addSchema(schema)
  }

  await fastify.register(prismaPlugin)

  fastify.register(authPlugin, { helmetOpts })

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

  fastify.get('/healthcheck', async () => {
    return 'OK'
  })

  fastify.register(userRoutes, { prefix: 'api/users' })
  fastify.register(postRoutes, { prefix: 'api/posts' })

  try {
    await fastify.listen({ port: process.env.PORT, host: process.env.HOST || '0.0.0.0' })
  } catch (error) {
    await fastify.close()

    fastify.log.fatal(error)
    process.exit(1)
  }

  fastify.log.info('%s@%s ONLINE', packageJSON.name, packageJSON.version)
}

setup()
