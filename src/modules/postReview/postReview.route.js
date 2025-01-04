import { postExists } from '../post/post.middleware.js'
import { $ref } from '../post/post.schema.js'
import { getAllPostReviews, getUserReviewByPostId, upsertReview } from './postReview.controller.js'

/**
 * @param {Fastify.Instance} fastify
 */
export default async function postReviewRoutes (fastify) {
  fastify.get('/id/:id/reviews', {
    preHandler: [postExists],
    schema: {
      params: $ref('postParamsId'),
      response: {
        200: $ref('postReviewsPaginatedResponseSchema')
      }
    }
  }, getAllPostReviews)

  fastify.get('/id/:id/review', {
    preHandler: [fastify.authenticate, postExists],
    schema: {
      params: $ref('postParamsId'),
      response: {
        200: $ref('postReviewResponseSchema')
      },
      description: 'Requires authorization cookie.'
    }
  }, getUserReviewByPostId)

  fastify.post('/id/:id/reviews', {
    preHandler: [fastify.authenticate, postExists],
    schema: {
      querystring: $ref('postPaginationQueries'),
      params: $ref('postParamsId'),
      body: $ref('postReviewAddRequestSchema'),
      description: 'Requires authorization cookie.'
    }
  }, upsertReview)
}
