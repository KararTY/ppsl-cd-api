import { $ref } from '../user/user.schema.js'
import { validateBioEditor } from './lexical.controller.js'

/**
 * @param {Fastify.Instance} fastify
 */
export default async function userRoutes (fastify) {
  fastify.post('/bio/validate', {
    preHandler: [fastify.authenticate],
    schema: {
      body: $ref('userProfileBioUpdateSchema'),
      description: 'Requires authorization cookie.'
    }
  }, validateBioEditor)
}
