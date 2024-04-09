import { ACTIVE_POSTHISTORY_WHERE } from '../../constants.js'
import { InvalidEditor, MissingTitle, NotFound } from '../../errors.js'
import { validateBioEditor } from '../lexical/lexical.controller.js'
import { getEntityMentions } from '../lexical/lexical.service.js'
import { SYSTEM_IDS } from '../lexical/ppsl-cd-lexical-shared/src/editors/constants.js'
import { updatePostById } from '../post/post.controller.js'
import { postWithContentById } from '../post/post.service.js'
import { createPostHistory, replaceActivePostHistory } from '../postHistory/postHistory.service.js'
import { createReview, updateReview, allReviewsForPostIdPaginated, reviewByUserIdAndToPostId } from '../postReview/postReview.service.js'
import { getAuthenticatedUserSession } from '../user/user.controller.js'

const { ENTITY } = SYSTEM_IDS

export async function updateReviewPost (request, { post, outRelations, title, transformedSystemRelations, language, stringifiedContent }) {
  const prisma = request.server.prisma

  const session = getAuthenticatedUserSession(request)
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

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function upsertReview (request, reply) {
  const { id } = request.params

  // Does post we're doing a review for exist?
  const post = await postWithContentById(request.server.prisma, id)

  if (!post) return NotFound(reply)

  // Can we do a review for it?
  // TODO: In the future, allow reviews on anything (But maybe not reviews).
  if (!post.outRelations.some((relation) => relation && relation.isSystem && relation.toPost.id === ENTITY)) {
    return reply.status(400).send({ message: "can't do review for this type of content" })
  }

  const { type } = request.body

  const session = getAuthenticatedUserSession(request)

  const postReview = await reviewByUserIdAndToPostId(request.server.prisma, session.user.id, { toPostId: post.id })

  if (!postReview) {
    const { language, /* content, */ title } = request.body
    // Content comes from validateReviewEditor.

    // TODO: Put this validation into a Zod schema.
    if (!title || title.length === 0) return MissingTitle(reply)

    // TODO: Create validateReviewEditor
    const { content: sanitizedContent, valid } = await validateBioEditor(request, reply, true)

    if (!valid) return InvalidEditor(request)

    const stringifiedContent = JSON.stringify(sanitizedContent)

    const mentions = await getEntityMentions(stringifiedContent)
    const outRelations = mentions.map((mentionPostId) => ({
      isSystem: false,
      toPostId: mentionPostId
    }))

    const id = await createReview(request.server.prisma, {
      userId: session.user.id,
      type,
      toPostId: post.id,
      outRelations
    })

    /**
     * @type {PrismaTypes.PostHistory}
     */
    const dataToInsert = {
      title,
      language,
      content: stringifiedContent,
      postId: id,
      endTimestamp: ACTIVE_POSTHISTORY_WHERE.endTimestamp.equals
    }

    await createPostHistory(request.server.prisma, session.user.id, dataToInsert)

    return { id }
  } else {
    request.post = postReview.fromPost // updatePostById requires existing post.
    request.body.type = type
    request.postReview = postReview
    return await updatePostById(request, reply)
  }
}

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function getAllPostReviews (request, reply) {
  const { id } = request.params
  const { cursor } = request.query

  const { postReviews, count } = await allReviewsForPostIdPaginated(request.server.prisma, id, cursor)

  if (postReviews.length === 0) {
    return {
      result: [],
      cursor,
      count
    }
  }

  return {
    result: postReviews,
    cursor: postReviews[postReviews.length - 1].id,
    count
  }
}

export async function getUserReviewByPostId (request, reply) {
  const { id } = request.params

  const session = getAuthenticatedUserSession(request)

  const res = await reviewByUserIdAndToPostId(request.server.prisma, session.user.id, { toPostId: id })

  if (!res) return NotFound(reply)

  return res
}
