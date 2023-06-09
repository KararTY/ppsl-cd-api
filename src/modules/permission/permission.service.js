import { SYSTEM_IDS } from '../../constants.js'
import { userAuthorByPostHistoryId } from '../user/user.service.js'

const { BIO, REVIEW, ENTITY, SYSTEM } = SYSTEM_IDS

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
 * @param {{ userId: string, postHistoryId: string, systemRelations: PrismaTypes.PostRelation[] }}
 */
export async function userHasPermissionWriteForPostByPostHistory (prisma, { userId, postHistoryId, systemRelations }) {
  const system = systemRelations.find((relation) => relation.toPostId === SYSTEM)
  if (system) return false

  // This post is a bio, write permission is exclusive to its own author.
  const bioRelation = systemRelations.find((relation) => relation.toPostId === BIO)
  if (bioRelation) {
    const author = await userAuthorByPostHistoryId(prisma, postHistoryId)
    return author.id === userId
  }

  // TODO: This post is a review, write permission is exclusive to its own author.
  const reviewRelation = systemRelations.find((relation) => relation.toPostId === REVIEW)
  if (reviewRelation) {
    const author = await userAuthorByPostHistoryId(prisma, postHistoryId)
    return author.id === userId
  }

  // This post is an entity, permission is write for all registered users.
  const entityRelation = systemRelations.find((relation) => relation.toPostId === ENTITY)
  if (entityRelation) return true

  return false
}
