import { getUser } from './user.controller.js'
import { $ref } from './user.schema.js'

/**
 * @param {import("fastify").FastifyInstance} fastify
 */
export default async function userRoutes (fastify) {
  await fastify.get('/', {
    preHandler: [fastify.authenticate],
    schema: {
      response: {
        200: $ref('userResponseSchema')
      }
    }
  }, getUser)
}
