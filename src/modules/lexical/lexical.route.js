import { $ref as $userRef } from '../user/user.schema.js'
import { $ref as $postRef } from '../post/post.schema.js'
import { postHistoryExists } from '../post/postHistory.middleware.js'
import { lexicalBioHTMLTransform, lexicalEntityHTMLTransform, validateBioEditor, validateEntityEditor } from './lexical.controller.js'

/**
 * @param {Fastify.Instance} fastify
 */
export default async function lexicalRoutes (fastify) {
  fastify.post('/bio/validate', {
    preHandler: [fastify.authenticate],
    schema: {
      body: $userRef('userProfileBioUpdateSchema'),
      description: 'Requires authorization cookie.'
    }
  }, validateBioEditor)

  fastify.post('/entity/validate', {
    preHandler: [fastify.authenticate],
    schema: {
      body: $userRef('userProfileBioUpdateSchema'),
      description: 'Requires authorization cookie.'
    }
  }, validateEntityEditor)

  fastify.get('/entity/:id', {
    preHandler: [postHistoryExists],
    schema: {
      params: $postRef('postParamsId')
    }
  }, lexicalEntityHTMLTransform)

  fastify.get('/bio/:id', {
    preHandler: [postHistoryExists],
    schema: {
      params: $postRef('postParamsId')
    }
  }, lexicalBioHTMLTransform)
}
