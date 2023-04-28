/**
 * @typedef {import('../../../.prisma/client').PrismaClient} PrismaClient
 */

/**
 * @param {PrismaClient} prisma
 */
export async function allPostsPaginated (prisma, cursor) {
  return await prisma.post.findMany({
    take: 50,
    skip: cursor ? 1 : undefined,
    cursor: cursor
      ? {
          id: cursor
        }
      : undefined,
    orderBy: {
      timestamp: 'desc'
    }
  })
}

/**
 * @param {PrismaClient} prisma
 */
export async function postById (prisma, id) {
  return await prisma.post.findFirst({
    where: {
      id
    }
  })
}

/**
 * @param {PrismaClient} prisma
 */
export async function postByPostId (prisma, postId) {
  return await prisma.post.findFirst({
    where: {
      postId
    },
    orderBy: {
      timestamp: 'desc'
    }
  })
}
