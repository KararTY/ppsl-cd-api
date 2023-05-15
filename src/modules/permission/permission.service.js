import { SYSTEM_IDS } from '../../constants.js'
import { userAuthorByPostHistoryId } from '../user/user.service.js'

const { BIO, REVIEW } = SYSTEM_IDS

/**
 * @type {import('../../../.prisma/client').Prisma.PostRelationInclude}
 */
const includeToPostPostHistory = {
  toPost: {
    select: {
      postHistory: {
        select: {
          postMetadata: {
            select: {
              userId: true
            }
          },
          title: true
        }
      }
    }
  }
}

/**
 * @param {PrismaClient} prisma
 */
export async function getAllPostRelations (prisma, postId) {
  return await prisma.postRelation.findMany({
    where: {
      fromPost: postId
    },
    include: includeToPostPostHistory
  })
}

/**
 * @param {PrismaClient} prisma
 */
export async function getSystemPostRelations (prisma, postId) {
  return await prisma.postRelation.findMany({
    where: {
      isSystem: true,
      fromPostId: postId
    },
    include: includeToPostPostHistory
  })
}

/**
 * @param {PrismaClient} prisma
 * @param {PrismaTypes.User} user
 * @param {PrismaTypes.PostHistory} postHistory
 */
export async function userHasPermissionWriteForPostId (prisma, user, postHistory) {
  const systemRelations = await getSystemPostRelations(prisma, postHistory.postId)

  // This post is a bio, write permission is exclusive to its own author.
  const bioRelation = systemRelations.find((relation) => relation.toPostId === BIO)
  if (bioRelation) {
    const author = await userAuthorByPostHistoryId(prisma, postHistory.id)
    return author.id === user.id
  }

  // TODO: This post is a review, write permission is exclusive to its own author.
  const reviewRelation = systemRelations.find((relation) => relation.toPostId === REVIEW)
  if (reviewRelation) {
    const author = await userAuthorByPostHistoryId(prisma, postHistory.id)
    return author.id === user.id
  }

  // TODO: This post is an entity, permission is write for all registered users.

  return false
}
