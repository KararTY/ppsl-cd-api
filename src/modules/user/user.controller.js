import errors from '../../errors.js'
import { createBio } from '../bio/bio.service.js'
import { validateBioEditor } from '../lexical/lexical.controller.js'

import { userProfileResponseSchema } from './user.schema.js'
import { userById } from './user.service.js'

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function getAuthenticatedUserSession (request) {
  return request.session
}

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function getUserById (request, reply) {
  const { id } = request.params

  const res = await userById(request.server.prisma, id)

  if (!res) return reply.status(404).send(errors.FST_ERR_NOT_FOUND())

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
  const { language, /* content, */ title } = request.body
  // Content comes from validateBioEditor.

  const session = await getAuthenticatedUserSession(request)

  const { content: sanitizedContent, valid } = await validateBioEditor(request, reply, true)

  if (!valid) return valid // Content was invalid.

  const user = await userById(request.server.prisma, session.user.id)

  const postHistoryRaw = user.postsMetadata[0].postHistory

  const postHistory = {
    id: postHistoryRaw.id,
    postId: postHistoryRaw.postId
  }

  // Only content, title and langauge, is going to be inserted.
  const dataToInsert = {
    title: title || postHistoryRaw.title,
    content: JSON.stringify(sanitizedContent),
    language
  }

  return await createBio(request.server.prisma, user.id, postHistory, dataToInsert)
}
