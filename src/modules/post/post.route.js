import { getPostById, getPostByPostId, getPosts } from './post.controller.js'
import { $ref } from './post.schema.js'

/**
 * @param {Fastify.Instance} fastify
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

  await fastify.get('/post/:postId', {
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
