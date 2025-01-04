
/**
 * @param {PrismaClient} prisma
 */
export async function yPostWithPostUpdatesByPostId (prisma, postId) {
  return prisma.yPost.findFirst({
    where: {
      id: postId
    },
    include: {
      html: {
        select: {
          content: true
        }
      },
      outRelations: {
        select: {
          isSystem: true,
          toPost: {
            select: {
              postUpdates: {
                select: {
                  title: true,
                  id: true
                },
                take: 1
              }
            }
          },
          toPostId: true
        }
      },
      postUpdates: {
        select: {
          content: true
        }
      }
    }
  })
}
