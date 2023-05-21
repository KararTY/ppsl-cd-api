import { NotFound } from '../../errors.js'
import { updatePostById } from '../post/post.controller.js'
import { postWithContentById } from '../post/post.service.js'

import { userProfileResponseSchema } from './user.schema.js'
import { userById } from './user.service.js'

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export function getAuthenticatedUserSession (request) {
  return request.session
}

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function getUserById (request, reply) {
  const { id } = request.params

  const res = await userById(request.server.prisma, id)

  if (!res) return NotFound(reply)

  const { email, id: userId, name, image } = res

  let cherryPickedData = { email, id: userId, name, image }

  if (res.postsMetadata.length > 0) {
    const postHistory = res.postsMetadata[0].postHistory

    cherryPickedData = { ...cherryPickedData, bio: postHistory }
  }

  // Has transforms to content.
  return userProfileResponseSchema.parse(cherryPickedData)
}

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function updateBio (request, reply) {
  const session = getAuthenticatedUserSession(request)

  const user = await userById(request.server.prisma, session.user.id)

  const postHistoryRaw = user.postsMetadata[0].postHistory

  const post = await postWithContentById(request.server.prisma, postHistoryRaw.postId)
  request.post = post // updatePostById requires existing post.
  return await updatePostById(request, reply)
}
