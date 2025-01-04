import { NotFound } from '../../errors.js'
import {
  yPostWithContentById,
  yPostWithLatestPostUpdateTitle
} from './post.service.js'

export async function yPostExists (request, reply) {
  const { id } = request.params

  const post = await yPostWithLatestPostUpdateTitle(request.server.prisma, id)

  if (!post) {
    return NotFound(reply)
  }

  request.post = post
}

export async function yPostWithContentExists (request, reply) {
  const { id } = request.params

  const post = await yPostWithContentById(request.server.prisma, id)

  if (!post) return NotFound(reply)

  request.post = post
}

/**
 * **Only usable when route has the postExists middleware.**
 * @param {Fastify.Request} request
 * @returns {Awaited<ReturnType<import('./post.service.js').yPostWithLatestPostUpdateTitle>>}
 */
export function getMiddlewarePost (request) {
  return request.post
}

/**
 * **Only usable when route has the postWithContentExists middleware.**
 * @param {Fastify.Request} request
 * @returns {Awaited<ReturnType<import('./post.service.js').yPostWithContentById>>}
 */
export function getMiddlewarePostWithContent (request) {
  return request.post
}
