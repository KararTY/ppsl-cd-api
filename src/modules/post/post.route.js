import { getPostById, getPostByPostId, getPosts, postPost } from './post.controller.js'
import { $ref } from './post.schema.js'

/**
 * @param {import("fastify").FastifyInstance} fastify
 */
export default async function postRoutes (fastify) {
  await fastify.get('/', {
    schema: {
      response: {
        200: $ref('allPostsResponseSchema')
      }
    }
  }, getPosts)

  await fastify.get('/id/:id', {
    schema: {
      response: {
        200: $ref('postResponseSchema')
      }
    }
  }, getPostById)

  await fastify.get('/post/:id', {
    schema: {
      response: {
        200: $ref('postResponseSchema')
      }
    }
  }, getPostByPostId)

  // await fastify.post('/post/:postId', {
  //   schema: {
  //     body: $ref('postRequestSchema')
  //   }
  // }, postPost)
}
