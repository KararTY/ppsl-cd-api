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
