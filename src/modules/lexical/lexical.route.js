import { $ref as $userRef } from '../user/user.schema.js'
import { validateUpdate } from './lexical.controller.js'

/**
 * @param {Fastify.Instance} fastify
 */
export default async function lexicalRoutes (fastify) {
  fastify.post('/validate', {
    preHandler: [fastify.authenticate],
    schema: {
      body: $userRef('userProfileBioUpdateSchema'),
      description: 'Requires authorization cookie.'
    }
  }, validateUpdate)
}
