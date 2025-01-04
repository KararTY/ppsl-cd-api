import { postExists } from '../post/post.middleware.js'
import { $ref } from '../post/post.schema.js'
import { getPostHistoriesByPostId } from './postHistory.controller.js'

/**
 * @param {Fastify.Instance} fastify
 */
export default async function postHistoryRoutes (fastify) {
  fastify.get('/id/:id/history', {
    preHandler: [postExists],
    schema: {
      querystring: $ref('postPaginationQueries'),
      params: $ref('postParamsId'),
      response: {
        200: $ref('postHistoriesPaginatedResponseSchema')
      }
    }
  }, getPostHistoriesByPostId)
}
