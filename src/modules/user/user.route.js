import { getAuthenticatedUserSession, getUserById, updateBio } from './user.controller.js'
import { $ref } from './user.schema.js'

/**
 * @param {Fastify.Instance} fastify
 */
export default async function userRoutes (fastify) {
  fastify.get('/:id', {
    preHandler: [fastify.authenticate],
    schema: {
      response: {
        200: $ref('userProfileResponseSchema')
      },
      description: 'Requires authorization cookie.'
    }
  }, getUserById)

  fastify.get('/session', {
    preHandler: [fastify.authenticate],
    schema: {
      response: {
        200: $ref('userSessionResponseSchema')
      },
      description: 'Requires authorization cookie.'
    }
  }, getAuthenticatedUserSession)

  fastify.post('/', {
    preHandler: [fastify.authenticate],
    schema: {
      body: $ref('userProfileBioUpdateSchema'),
      description: 'Requires authorization cookie.'
    }
  }, updateBio)
}
