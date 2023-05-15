import errors from '../../errors.js'
import { SYSTEM_IDS } from '../../constants.js'
import { createEntity } from '../entity/entity.service.js'
import { validateBioEditor, validateEntityEditor } from '../lexical/lexical.controller.js'
import { getEntityMentions } from '../lexical/lexical.service.js'
import { getAuthenticatedUserSession } from '../user/user.controller.js'

import { postResponseWithPostHistoryContentAndOutRelationsSchema, postReviewResponseSchema, postReviewsPaginatedResponseSchema } from './post.schema.js'
import { allPostsPaginated, postWithContentById, postWithSystemRelationsById } from './post.service.js'
import { allPostHistoriesPaginated } from './postHistory.service.js'
import { createReview, createReviewPostHistory, updateReview } from '../review/review.service.js'
import { allReviewsForPostIdPaginated, reviewByUserIdAndPostId } from './postReview.service.js'

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
  return postResponseWithPostHistoryContentAndOutRelationsSchema.parse(res)
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

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function upsertReview (request, reply) {
  const { id } = request.params

  // Does post we're doing a review for exist?
  const post = await postWithSystemRelationsById(request.server.prisma, id)

  if (!post) return reply.status(404).send(errors.FST_ERR_NOT_FOUND())

  // Can we do a review for it?
  // TODO: In the future, allow reviews on anything (But maybe not reviews).
  if (!post.outRelations.some((relation) => relation && relation.toPostId === SYSTEM_IDS.ENTITY)) return reply.status(400).send({ message: 'can\'t do review for this type of content' })

  const { language, /* content, */ title, type } = request.body
  // Content comes from validateReviewEditor.

  if (!title || title.length === 0) return reply.status(400).send({ message: 'title property missing or empty' })

  const session = await getAuthenticatedUserSession(request)

  // TODO: Create validateReviewEditor
  const { content: sanitizedContent, valid } = await validateBioEditor(request, reply, true)

  if (!valid) return reply.status(400).send({ message: 'Editor content was invalid.' }) // Content was invalid.

  const stringifiedContent = JSON.stringify(sanitizedContent)

  /**
   * @type {PrismaTypes.PostHistory}
   */
  const postHistory = {
    title,
    language,
    type,
    content: stringifiedContent
  }

  const mentions = await getEntityMentions(stringifiedContent)
  const outRelations = mentions.map((mentionPostId) => ({ isSystem: false, toPostId: mentionPostId }))

  let fromPostId

  const reviewPost = await reviewByUserIdAndPostId(request.server.prisma, session.user.id, post.id)

  if (!reviewPost) {
    const id = await createReview(request.server.prisma, session.user.id, postHistory, post.id, outRelations)
    fromPostId = id
  } else {
    fromPostId = reviewPost.fromPostId
    await updateReview(request.server.prisma, reviewPost, post.id, postHistory, outRelations)
  }

  return await createReviewPostHistory(request.server.prisma, session.user.id, fromPostId, post.id, postHistory, mentions)
}

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function getAllPostReviews (request, reply) {
  const { id } = request.params
  const { cursor } = request.query

  const res = await allReviewsForPostIdPaginated(request.server.prisma, id, cursor)

  if (res.length === 0) {
    return {
      result: [],
      cursor
    }
  }

  return postReviewsPaginatedResponseSchema.parse({
    result: res,
    cursor: res[res.length - 1].id
  })
}

export async function getUserReviewByPostId (request, reply) {
  const { id } = request.params

  const session = await getAuthenticatedUserSession(request)

  const res = await reviewByUserIdAndPostId(request.server.prisma, session.user.id, id)

  if (!res) return reply.status(404).send(errors.FST_ERR_NOT_FOUND())

  // Custom transform for content using `@msgpack/msgpack`.
  return postReviewResponseSchema.parse(res)
}
