import errors from '../../errors.js'
import { SYSTEM_IDS } from '../../constants.js'
import { createEntity } from '../entity/entity.service.js'
import { validateEntityEditor } from '../lexical/lexical.controller.js'
import { getEntityMentions } from '../lexical/lexical.service.js'
import { getAuthenticatedUserSession } from '../user/user.controller.js'

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

  // Custom transform for content using `@msgpack/msgpack`.
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

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function createEntityPost (request, reply) {
  const { language, /* content, */ title } = request.body
  // Content comes from validateEntityEditor.

  if (!title || title.length === 0) return reply.status(400).send({ message: 'title property missing or empty' })

  const session = await getAuthenticatedUserSession(request)

  const { content: sanitizedContent, valid } = await validateEntityEditor(request, reply, true)

  if (!valid) return reply.status(400).send({ message: 'Editor content was invalid.' }) // Content was invalid.

  const stringifiedContent = JSON.stringify(sanitizedContent)

  const mentions = await getEntityMentions(stringifiedContent)

  /**
   * Only content, title and langauge, is going to be inserted.
   * @type {PrismaTypes.PostHistory}
   */
  const postHistory = {
    title,
    language,
    content: stringifiedContent
  }

  return await createEntity(request.server.prisma, session.user.id, postHistory, mentions)
}
