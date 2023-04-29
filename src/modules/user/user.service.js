/**
 * @param {PrismaClient} prisma
 */
export async function userById (prisma, id) {
  return await prisma.user.findUnique({
    where: {
      id
    }
  })
}
