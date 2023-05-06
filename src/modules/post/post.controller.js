import errors from '../../errors.js'
import { SYSTEM_IDS } from '../../schemas.js'
import { postResponseWithPostHistoryContentSchema } from './post.schema.js'
import { allPostsPaginated, postWithContentById } from './post.service.js'

import { allPostHistoriesPaginated } from './postHistory.service.js'

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function getAllPosts (request, reply) {
  const { cursor } = request.query
  const filter = request.body
  const res = await allPostsPaginated(request.server.prisma, cursor, filter)

  if (res.length === 0) {
    return {
      result: [],
      cursor
    }
  }

  return {
    result: res,
    cursor: res[res.length - 1].id
  }
}

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function getAllSystemPosts (request, reply) {
  const { cursor } = request.query
  const res = await allPostsPaginated(request.server.prisma, cursor, {
    outRelations: {
      some: {
        toPostId: SYSTEM_IDS.SYSTEM
      }
    }
  })

  if (res.length === 0) {
    return {
      result: [],
      cursor
    }
  }

  return {
    result: res,
    cursor: res[res.length - 1].id
  }
}

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function getPostById (request, reply) {
  const { id } = request.params
  const res = await postWithContentById(request.server.prisma, id)

  if (!res) return reply.status(404).send(errors.FST_ERR_NOT_FOUND())

  // Custom transform for content using "@msgpack/msgpack".
  return postResponseWithPostHistoryContentSchema.parse(res)
}

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function getPostHistoriesByPostId (request, reply) {
  const { cursor } = request.query
  const { id } = request.params

  const res = await allPostHistoriesPaginated(request.server.prisma, cursor, {
    postId: id
  })

  if (res.length === 0) {
    return {
      result: [],
      cursor
    }
  }

  return {
    result: res,
    cursor: res[res.length - 1].id
  }
}

// /**
//  * @param {Fastify.Request} request
//  * @param {Fastify.Reply} reply
//  */
// export async function postPost (request, reply) {
//   const { postId } = request.params
//
//   const body = {
//     ...request.body,
//     postId
//   }
//
//   const { id } = await request.server.prisma.post.create({
//     data: body
//   })
//
//   return {
//     id,
//     postId
//   }
// }
