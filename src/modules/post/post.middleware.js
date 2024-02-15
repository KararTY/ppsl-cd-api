import { NotFound } from '../../errors.js'
import { yPostWithLatestPostUpdateTitle } from './post.service.js'

export async function postExists (request, reply) {
  const { id } = request.params

  const post = await yPostWithLatestPostUpdateTitle(request.server.prisma, id)

  if (!post) return NotFound(reply)

  request.post = post
}

/**
 * **Only usable when route has the postExists middleware.**
 * @param {Fastify.Request} request
 * @returns {Awaited<ReturnType<import('./post.service.js').yPostWithContentById>>}
 */
export function getMiddlewarePost (request) {
  return request.post
}
