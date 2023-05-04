import { getAllSystemPosts, getPostById, getAllPosts } from './post.controller.js'
import { $ref } from './post.schema.js'

/**
 * @param {Fastify.Instance} fastify
 */
export default async function postRoutes (fastify) {
  fastify.get('/', {
    schema: {
      response: {
        200: $ref('allPostsResponseSchema')
      }
    }
  }, getAllPosts)

  fastify.post('/filter', {
    schema: {
      body: $ref('postsFilterRequestSchema'),
      response: {
        200: $ref('allPostsResponseSchema')
      }
    }
  }, getAllPosts)

  fastify.get('/system', {
    schema: {
      response: {
        200: $ref('allPostsResponseSchema')
      }
    }
  }, getAllSystemPosts)

  fastify.get('/id/:id', {
    schema: {
      response: {
        200: $ref('postResponseSchema')
      }
    }
  }, getPostById)

  // await fastify.post('/post/:postId', {
  //   schema: {
  //     body: $ref('postRequestSchema')
  //   }
  // }, postPost)
}
