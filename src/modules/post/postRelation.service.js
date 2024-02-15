/**
 * @param {PrismaClient} prisma
 * @param {string} fromPostId
 */
export async function postRelationDeleteByFromPostId (prisma, fromPostId) {
  return await prisma.postRelation.deleteMany({
    where: {
      fromPostId
    }
  })
}

/**
 * @param {PrismaClient} prisma
 * @param {string} fromPostId
 */
export async function postYRelationDeleteByFromPostId (prisma, fromPostId) {
  return await prisma.yPostRelation.deleteMany({
    where: {
      fromPostId
    }
  })
}
