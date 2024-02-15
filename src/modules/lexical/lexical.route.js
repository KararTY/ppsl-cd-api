import { $ref as $userRef } from '../user/user.schema.js'
import { $ref as $postRef } from '../post/post.schema.js'
import { lexicalHTMLTransform, validateEditor } from './lexical.controller.js'

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
  }, validateEditor)

  fastify.get('/html/:id', {
    schema: {
      params: $postRef('postParamsId')
    }
  }, lexicalHTMLTransform)
}
