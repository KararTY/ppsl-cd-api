const activePostHistorySelect = {
  postHistory: {
    where: {
      endTimestamp: {
        equals: null
      }
    },
    take: 1
  }
}

/**
 * @param {PrismaClient} prisma
 * @param {import('../../../.prisma/client').Prisma.PostWhereInput} filter
 */
export async function allPostsPaginated (prisma, cursor, filter) {
  return await prisma.post.findMany({
    take: 50,
    skip: cursor ? 1 : undefined,
    cursor: cursor
      ? {
          id: cursor
        }
      : undefined,
    where: filter
  })
}

/**
 * @param {PrismaClient} prisma
 */
export async function postWithContentById (prisma, id) {
  return await prisma.post.findFirst({
    where: {
      id
    },
    include: activePostHistorySelect
  })
}

/**
 * @param {PrismaClient} prisma
 */
// export async function postRelationsByFromPostId (prisma, id) {
//   return await prisma.postRelation.findMany({
//     where: {
//       fromPostId: id
//     }
//   })
// }
