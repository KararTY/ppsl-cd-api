import { SYSTEM_IDS } from '../../constants.js'
import { postRelationDeleteByFromPostId } from '../post/postRelation.service.js'

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
              toPostId: SYSTEM_IDS.REVIEW
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
              toPostId: SYSTEM_IDS.REVIEW
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
