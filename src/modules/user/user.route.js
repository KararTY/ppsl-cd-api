import { getUser } from './user.controller.js'
import { $userSchemasRef, userSchemas } from './user.schema.js'

/**
 * @param {import("fastify").FastifyInstance} fastify
 */
async function userRoutes (fastify) {
  for (let index = 0; index < userSchemas.length; index++) {
    const schema = userSchemas[index]
    await fastify.addSchema(schema)
  }

  fastify.get('/', {
    preHandler: [fastify.authenticate],
    schema: {
      response: {
        200: $userSchemasRef('userResponseSchema')
      }
    }
  }, getUser)
}

export default userRoutes
