/**
 * @param {PrismaClient} prisma
 * @param {string} toPostId
 */
export async function postRelationDeleteAllByToPostId (prisma, toPostId) {
  return await prisma.postRelation.deleteMany({
    where: {
      toPostId
    }
  })
}
