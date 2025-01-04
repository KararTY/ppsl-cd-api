import { allPostHistoriesPaginated } from './postHistory.service.js'

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
