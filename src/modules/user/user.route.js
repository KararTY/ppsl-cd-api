import { getAuthenticatedUser } from './user.controller.js'
import { $ref } from './user.schema.js'

/**
 * @param {Fastify.Instance} fastify
 */
export default async function userRoutes (fastify) {
  await fastify.get('/session', {
    preHandler: [fastify.authenticate],
    schema: {
      response: {
        200: $ref('userSessionResponseSchema')
      }
    }
  }, getAuthenticatedUser)
}
