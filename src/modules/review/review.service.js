import { SYSTEM_IDS } from '../lexical/ppsl-cd-lexical-shared/src/editors/constants.js'
import { postRelationDeleteByFromPostId } from '../post/postRelation.service.js'

const { REVIEW } = SYSTEM_IDS

/**
 * @param {PrismaClient} prisma
 */
export async function createReview (prisma, { userId, type, toPostId, outRelations }) {
  const { id } = await prisma.post.create({
    data: {
      outRelations: {
        createMany: {
          data: [
            {
              isSystem: true,
              toPostId: REVIEW
            },
            ...outRelations
          ],
          skipDuplicates: true
        }
      }
    }
  })

  await prisma.postReview.create({
    data: {
      type: type || 'NEUTRAL',
      user: {
        connect: {
          id: userId
        }
      },
      fromPost: {
        connect: {
          id
        }
      },
      toPost: {
        connect: {
          id: toPostId
        }
      }
    }
  })

  return id
}

/**
 * @param {PrismaClient} prisma
 */
export async function updateReview (prisma, { review, postId, type, outRelations, systemRelations }) {
  await prisma.postReview.update({
    where: {
      id: review.id
    },
    data: {
      type
    }
  })

  await postRelationDeleteByFromPostId(prisma, postId)

  await prisma.post.update({
    where: {
      id: postId
    },
    data: {
      outRelations: {
        createMany: {
          data: [
            {
              isSystem: true,
              toPostId: REVIEW
            },
            ...systemRelations,
            ...outRelations
          ],
          skipDuplicates: true
        }
      },
      lastUpdated: new Date()
    }
  })
}
