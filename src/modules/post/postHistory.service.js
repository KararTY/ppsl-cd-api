import { ACTIVE_POSTHISTORY_WHERE } from '../../constants.js'
import { updatePostLastUpdatedById } from './post.service.js'

export const authorThroughMetadataInclude = {
  include: {
    postMetadata: {
      include: {
        user: {
          select: {
            name: true,
            id: true
          }
        }
      }
    }
  }
}

/**
 * @param {PrismaClient} prisma
 * @param {import('../../../.prisma/client').Prisma.PostHistoryWhereInput} filter
 * @param {import('../../../.prisma/client').Prisma.PostHistoryInclude} include
 */
export async function allPostHistoriesPaginated (prisma, cursor, filter) {
  return await prisma.postHistory.findMany({
    take: 50,
    skip: cursor ? 1 : undefined,
    cursor: cursor
      ? {
          id: cursor
        }
      : undefined,
    where: filter,
    include: {
      postMetadata: {
        select: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }
    }
  })
}

/**
 * @param {PrismaClient} prisma
 * @param {import('../../../.prisma/client').Prisma.PostHistoryPostIdLanguageEndTimestampCompoundUniqueInput} postIdLanguageEndTimestamp
 */
export async function updatePostHistoryEndTimestampByCompoundUniqueId (prisma, postIdLanguageEndTimestamp, newEndTimestamp) {
  const { endTimestamp } = await prisma.postHistory.update({
    where: {
      postId_language_endTimestamp: postIdLanguageEndTimestamp
    },
    data: {
      endTimestamp: newEndTimestamp
    }
  })

  return endTimestamp
}

/**
 * Create postMetadata, & postHistory
 * @param {PrismaClient} prisma
 * @param {string} userId
 * @param {PrismaTypes.PostHistory} data
 */
export async function createPostHistory (prisma, userId, data) {
  return await prisma.postMetadata.create({
    data: {
      user: {
        connect: {
          id: userId
        }
      },
      postHistory: {
        create: {
          ...data
        }
      }
    }
  }).postHistory({ select: { id: true, title: true, language: true, createdTimestamp: true } })
}

/**
 * @param {PrismaClient} prisma
 * @param {PrismaTypes.PostHistory} data
 */
export async function replaceActivePostHistory (prisma, userId, data) {
  data.endTimestamp = new Date(990821)

  const newPostHistory = await createPostHistory(prisma, userId, data)

  // Add endTimestamp on previous postHistory.
  await updatePostHistoryEndTimestampByCompoundUniqueId(prisma, {
    postId: data.postId,
    endTimestamp: ACTIVE_POSTHISTORY_WHERE.endTimestamp.equals,
    language: data.language || 'en'
  }, new Date())

  // Enable new postHistory.
  await prisma.postHistory.update({
    where: {
      id: newPostHistory.id
    },
    data: {
      endTimestamp: ACTIVE_POSTHISTORY_WHERE.endTimestamp.equals
    }
  })

  await updatePostLastUpdatedById(prisma, data.postId, newPostHistory.createdTimestamp)

  return { id: data.postId, postHistory: newPostHistory }
}
