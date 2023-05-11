import { $ref } from '../user/user.schema.js'
import { validateBioEditor, validateEntityEditor } from './lexical.controller.js'

/**
 * @param {Fastify.Instance} fastify
 */
export default async function lexicalRoutes (fastify) {
  fastify.post('/bio/validate', {
    preHandler: [fastify.authenticate],
    schema: {
      body: $ref('userProfileBioUpdateSchema'),
      description: 'Requires authorization cookie.'
    }
  }, validateBioEditor)

  fastify.post('/entity/validate', {
    preHandler: [fastify.authenticate],
    schema: {
      body: $ref('userProfileBioUpdateSchema'),
      description: 'Requires authorization cookie.'
    }
  }, validateEntityEditor)
}
