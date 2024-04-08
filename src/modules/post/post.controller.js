import { InvalidEditor, MissingTitle, NoPermissions, NoValidationAvailable, NotFound } from '../../errors.js'
import { createYEntity, updateYEntity } from '../entity/entity.service.js'
import { updateReview } from '../review/review.service.js'
import { getAuthenticatedUserSession } from '../user/user.controller.js'
import { postAuthors } from '../user/user.service.js'
import { SYSTEM_IDS } from '../lexical/ppsl-cd-lexical-shared/src/editors/constants.js'
import { validateEditor, validateEntityEditor } from '../lexical/lexical.controller.js'
import { getEntityMentions } from '../lexical/lexical.service.js'
import { getSystemYPostRelations, userHasPermissionWriteForYPostByPostUpdate } from '../permission/permission.service.js'
import { allPostsPaginated } from './post.service.js'
import { allPostHistoriesPaginated, createYPostUpdate, postWithPostUpdatesByPostId, replaceActivePostHistory } from '../postHistory/postHistory.service.js'
import { reviewByUserIdAndToPostId } from '../postReview/postReview.service.js'
import { getMiddlewarePost } from './post.middleware.js'
import { mergePostUpdates, postUpdatesToUint8Arr, uint8ArrayToString } from '../lexical/yjs.js'

const { SYSTEM, ENTITY, BIO, REVIEW } = SYSTEM_IDS

const excludeBioPosts = {
  outRelations: {
    some: {
      isSystem: true,
      toPostId: {
        not: 'bio'
      }
    }
  }
}

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function getAllPosts (request, reply) {
  const { cursor } = request.query
  let filter = request.body

  if (filter.AND) {
    filter.AND.push(excludeBioPosts)
  } else {
    filter = {
      AND: [{
        ...filter
      },
      { ...excludeBioPosts }
      ]
    }
  }

  const { posts, count } = await allPostsPaginated(request.server.prisma, cursor, filter)

  if (posts.length === 0) {
    return {
      result: [],
      cursor,
      count
    }
  }

  return {
    result: posts,
    cursor: posts[posts.length - 1].id,
    count
  }
}

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function getAllSystemPosts (request, reply) {
  const { cursor } = request.query
  const { posts, count } = await allPostsPaginated(request.server.prisma, cursor, {
    outRelations: {
      some: {
        toPostId: SYSTEM
      }
    }
  })

  if (posts.length === 0) {
    return {
      result: [],
      cursor,
      count
    }
  }

  return {
    result: posts,
    cursor: posts[posts.length - 1].id,
    count
  }
}

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function getPostUpdatesAsData (request, reply) {
  const post = await postWithPostUpdatesByPostId(request.server.prisma, request.params.id)

  const update = uint8ArrayToString(mergePostUpdates(postUpdatesToUint8Arr(post.postUpdates)))

  post.postUpdates = request.post.postUpdates

  return { post, update }
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

  if (!title || title.length === 0) return MissingTitle(reply)

  const session = getAuthenticatedUserSession(request)

  const { content: sanitizedContent, rawContent, valid } = await validateEntityEditor(request, reply, true)

  if (!valid) return InvalidEditor(reply)

  const stringifiedContent = JSON.stringify(sanitizedContent)
  const mentions = await getEntityMentions(stringifiedContent)

  /**
   * @type {PrismaTypes.PostHistory}
   */
  const dataToInsert = {
    title,
    content: rawContent
  }

  return await createYEntity(request.server.prisma, {
    userId: session.user.id,
    language,
    data: dataToInsert,
    mentions
  })
}

/**
 * This is a global Post update, it should handle any kind of update.
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function updatePostById (request, reply) {
  const prisma = request.server.prisma

  const post = getMiddlewarePost(request)

  const session = getAuthenticatedUserSession(request)

  const { postUpdates } = post
  const latestPostUpdate = postUpdates[0]

  const systemRelations = await getSystemYPostRelations(prisma, post.id)

  const transformedSystemRelations = systemRelations.map((sysRelation) =>
    ({ isSystem: sysRelation.isSystem, toPostId: sysRelation.toPostId })
  )

  const hasPermission = await userHasPermissionWriteForYPostByPostUpdate(prisma, {
    userId: session.user.id,
    postHistoryId: latestPostUpdate.id,
    systemRelations
  })

  if (!hasPermission) return NoPermissions(reply)

  const { content, title, language } = request.body

  // TODO: Add LANGUAGE validation.

  if (!title || title.length === 0) return MissingTitle(reply)

  const entity = systemRelations.some((sysRelation) => sysRelation.toPostId === ENTITY) && ENTITY
  const bio = systemRelations.some((sysRelation) => sysRelation.toPostId === BIO) && BIO
  const review = systemRelations.some((sysRelation) => sysRelation.toPostId === REVIEW) && REVIEW

  const type = entity || bio || review

  // const existingUpdates = postUpdatesToUint8Arr(postUpdates)
  // const stateVector = getStateVectorFromUpdate(mergePostUpdates(existingUpdates))
  // const diff = diffUpdateUsingStateVector(request.)

  const newUpdate = postUpdatesToUint8Arr([{ content }])
  const combinedUpdate = postUpdatesToUint8Arr(postUpdates.concat(newUpdate))
  const { content: sanitizedContent, rawContent, valid } = await validateEditor({ type, update: combinedUpdate }, reply)

  if (!sanitizedContent) return NoValidationAvailable(reply)

  if (!valid) return InvalidEditor(reply)

  const stringifiedContent = JSON.stringify(sanitizedContent)
  const mentions = await getEntityMentions(stringifiedContent)
  const outRelations = mentions.map((mentionPostId) => ({
    isSystem: false,
    toPostId: mentionPostId
  }))

  if (entity) {
    return await prisma.$transaction(async (tx) => {
      await updateYEntity(tx, {
        post,
        outRelations,
        systemRelations: transformedSystemRelations
      })

      /**
       * @type {PrismaTypes.YPostUpdate}
       */
      const dataToInsert = {
        title,
        content: rawContent,
        postId: post.id
      }

      return await createYPostUpdate(tx, session.user.id, dataToInsert)
    })
  } else if (bio) {
    /**
     * @type {PrismaTypes.PostHistory}
     */
    const dataToInsert = {
      title: title || latestPostUpdate.title || 'Bio',
      language,
      content: stringifiedContent,
      postId: post.id
    }

    return await replaceActivePostHistory(prisma, session.user.id, dataToInsert)
  } else if (review) {
    const { type } = request.body

    const postReview = request.postReview || await reviewByUserIdAndToPostId(prisma, session.user.id, { fromPostId: post.id })

    await updateReview(prisma, {
      review: postReview,
      postId: post.id,
      type,
      outRelations,
      systemRelations: transformedSystemRelations
    })

    /**
     * @type {PrismaTypes.PostHistory}
     */
    const dataToInsert = {
      title,
      language,
      content: stringifiedContent,
      postId: post.id
    }

    return await replaceActivePostHistory(request.server.prisma, session.user.id, dataToInsert)
  }
}

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function getPostAuthors (request, reply) {
  const { id } = request.params

  const res = await postAuthors(request.server.prisma, id)

  if (!res) return NotFound(reply)

  return res
}
