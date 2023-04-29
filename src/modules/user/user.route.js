import { getAuthenticatedUser, getUserById } from './user.controller.js'
import { $ref } from './user.schema.js'

/**
 * @param {Fastify.Instance} fastify
 */
export default async function userRoutes (fastify) {
  await fastify.get('/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      response: {
        200: $ref('userProfileResponseSchema')
      }
    }
  }, getUserById)

  await fastify.get('/session', {
    preHandler: [fastify.authenticate],
    schema: {
      response: {
        200: $ref('userSessionResponseSchema')
      }
    }
  }, getAuthenticatedUser)
}
