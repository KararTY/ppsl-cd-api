import { uint8ArrayToBase64 } from 'uint8array-extras'

import { INTERNAL_REQUEST } from '../../constants.js'
import {
  InvalidEditor,
  MissingTitle,
  NoPermissions,
  NoValidationAvailable,
  NotFound
} from '../../errors.js'
import { createEntity } from '../entity/entity.service.js'
import { updateEntityYPost } from '../entity/entity.controller.js'
import { getAuthenticatedUserSession } from '../user/user.controller.js'
import { postAuthors } from '../user/user.service.js'
import {
  diffUpdateUsingStateVector,
  encodeYDocToUpdateV2,
  getStateVectorFromUpdate,
  mergePostUpdates,
  postUpdatesToUint8Arr,
  yPostUpdatesToBase64
} from '../lexical/yjs.js'
import { SYSTEM_IDS } from '../lexical/ppsl-cd-lexical-shared/src/editors/constants.js'
import {
  validateUpdate,
  validateEntityEditor
} from '../lexical/lexical.controller.js'
import {
  defaultUpdate,
  getEntityMentions
} from '../lexical/lexical.service.js'
import {
  getSystemYPostRelations,
  userHasPermissionWriteForYPostByPostUpdate
} from '../permission/permission.service.js'
import { updateReviewYPost } from '../postReview/postReview.controller.js'
import { yPostWithPostUpdatesByPostId } from '../postUpdate/postUpdate.service.js'
import toHTML from '../lexical/ppsl-cd-lexical-shared/src/toHTML/index.js'

import {
  getMiddlewarePost,
  getMiddlewarePostWithContent
} from './post.middleware.js'
import { allYPostsPaginated, upsertHTML } from './post.service.js'
import { getPostType } from '../lexical/ppsl-cd-lexical-shared/src/editors/utils.js'

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
      AND: [
        {
          ...filter
        },
        { ...excludeBioPosts }
      ]
    }
  }

  const { posts, count } = await allYPostsPaginated(
    request.server.prisma,
    cursor,
    filter
  )

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
  const { posts, count } = await allYPostsPaginated(
    request.server.prisma,
    cursor,
    {
      outRelations: {
        some: {
          toPostId: SYSTEM
        }
      }
    }
  )

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
 * @param {PrismaClient} prisma
 * @param {string} id
 */
const getYPostHTML = async (prisma, id) => {
  /**
   * @type {NonNullable<Awaited<ReturnType<yPostWithPostUpdatesByPostId>>>}
   */
  const post = await yPostWithPostUpdatesByPostId(prisma, id)

  if (post.html?.content) {
    return { post: { ...post, html: undefined }, html: post.html.content }
  }

  const mergedUpdate = yPostUpdatesToBase64(post.postUpdates)

  if (!mergedUpdate) {
    return { post, html: null }
  }

  const type = getPostType(post)

  const html = await toHTML({ update: mergedUpdate }, type)

  Promise.resolve(upsertHTML(prisma, post.id, html))

  return { post, html }
}

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function getYPostById (request, reply) {
  const { post, html } = await getYPostHTML(
    request.server.prisma,
    request.params.id
  )

  // Use latest postUpdate for post.postUpdates.
  post.postUpdates = getMiddlewarePost(request).postUpdates

  return { post, html }
}

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function createEntityPost (request, reply) {
  const { language, /* content, */ title } = request.body
  // Content comes from validateEntityEditor.

  // TODO: Put this validation into a Zod schema.
  if (!title || title.length === 0) return MissingTitle(reply)

  const session = getAuthenticatedUserSession(request)

  const { valid, doc, editor } = await validateEntityEditor(
    request,
    reply,
    INTERNAL_REQUEST
  )

  if (!valid) {
    return InvalidEditor(reply)
  }

  const mentions = await getEntityMentions(editor)

  // By this point, we have probably modified the editor. Let's recreate the content.
  const backendUpdate = encodeYDocToUpdateV2(doc)

  const { byteLength } = backendUpdate

  const backendContent = uint8ArrayToBase64(backendUpdate)

  const body = { language, data: { title, content: backendContent }, mentions }
  const metadata = {
    user: { name: session.user.name, id: session.user.id },
    byteLength
  }

  const createdEntity = await createEntity(
    request.server.prisma,
    body,
    metadata
  )

  // await upsertHTML(createdArticle.id, await toHTML({ config: 'article', update: backendContent }))

  return createdEntity
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

  // TODO: Put this validation into a Zod schema.
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
    return await updateEntityPost(request, { post, outRelations, transformedSystemRelations, title, rawContent })
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
    return await updateReviewPost(request, { post, outRelations, title, transformedSystemRelations, language, stringifiedContent })
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

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export const getInitialUpdate = (request, reply) => {
  const { type } = request.params

  const initialUpdate = defaultUpdate[type]

  return initialUpdate
}

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function cacheBustHTML (request, reply) {
  const { id } = request.params

  /**
   * @type {NonNullable<Awaited<ReturnType<yPostWithPostUpdatesByPostId>>>}
   */
  const post = await yPostWithPostUpdatesByPostId(request.server.prisma, id)

  const type = getPostType(post)

  const mergedUpdate = yPostUpdatesToBase64(post.postUpdates)

  if (!mergedUpdate) {
    return { post, html: null }
  }

  const html = await toHTML({ update: mergedUpdate }, type)

  Promise.resolve(upsertHTML(request.server.prisma, post.id, html))

  return html
}
