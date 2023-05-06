import { getAllSystemPosts, getPostById, getAllPosts, getPostHistoriesByPostId } from './post.controller.js'
import { $ref } from './post.schema.js'

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

  // fastify.get('/id/:id/history/:historyId', {
  //   schema: {
  //     params: $ref('postHistoryParamsId'),
  //     // response: {
  //     //   200: $ref('postHistoryResponseSchema')
  //     // }
  //   }
  // }, getPostHistoryByHistoryId)

  // fastify.post('/post/:postId', {
  //   schema: {
  //     body: $ref('postRequestSchema')
  //   }
  // }, postPost)
}
