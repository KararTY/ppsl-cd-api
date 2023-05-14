import {
  getAllSystemPosts,
  getPostById,
  getAllPosts,
  getPostHistoriesByPostId,
  createEntityPost,
  updateReview,
  getAllPostReviews,
  getUserReviewByPostId
} from './post.controller.js'
import { $ref } from './post.schema.js'
import { $ref as $refUser } from '../user/user.schema.js'

/**
 * @param {Fastify.Instance} fastify
 */
export default async function postRoutes (fastify) {
  fastify.get('/', {
    schema: {
      querystring: $ref('postPaginationQueries'),
      response: {
        200: $ref('postsPaginatedResponseSchema')
      }
    }
  }, getAllPosts)

  fastify.post('/filter', {
    schema: {
      querystring: $ref('postPaginationQueries'),
      body: $ref('postsFilterRequestSchema'),
      response: {
        200: $ref('postsPaginatedResponseSchema')
      }
    }
  }, getAllPosts)

  fastify.get('/system', {
    schema: {
      querystring: $ref('postPaginationQueries'),
      response: {
        200: $ref('postsPaginatedResponseSchema')
      }
    }
  }, getAllSystemPosts)

  fastify.get('/id/:id', {
    schema: {
      params: $ref('postParamsId'),
      response: {
        200: $ref('postResponseWithPostHistoryContentSchema')
      }
    }
  }, getPostById)

  fastify.get('/id/:id/history', {
    schema: {
      querystring: $ref('postPaginationQueries'),
      params: $ref('postParamsId'),
      response: {
        200: $ref('postHistoriesPaginatedResponseSchema')
      }
    }
  }, getPostHistoriesByPostId)

  fastify.post('/', {
    preHandler: [fastify.authenticate],
    schema: {
      body: $refUser('userProfileBioUpdateSchema'),
      description: 'Requires authorization cookie.'
    }
  }, createEntityPost)

  fastify.get('/id/:id/reviews', {
    schema: {
      params: $ref('postParamsId'),
      response: {
        200: $ref('postReviewsPaginatedResponseSchema')
      }
    }
  }, getAllPostReviews)

  fastify.get('/id/:id/review', {
    preHandler: [fastify.authenticate],
    schema: {
      params: $ref('postParamsId'),
      response: {
        200: $ref('postReviewResponseSchema')
      }
    }
  }, getUserReviewByPostId)

  fastify.post('/id/:id/reviews', {
    preHandler: [fastify.authenticate],
    schema: {
      querystring: $ref('postPaginationQueries'),
      params: $ref('postParamsId'),
      body: $ref('postReviewAddRequestSchema'),
      description: 'Requires authorization cookie.'
    }
  }, updateReview)

  // fastify.get('/id/:id/history/:historyId', {
  //   schema: {
  //     params: $ref('postHistoryParamsId'),
  //     // response: {
  //     //   200: $ref('postHistoryResponseSchema')
  //     // }
  //   }
  // }, getPostHistoryByHistoryId)
}
