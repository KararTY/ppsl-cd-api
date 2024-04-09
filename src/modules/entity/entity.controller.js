import { createYPostUpdate } from '../postHistory/postHistory.service.js'
import { getAuthenticatedUserSession } from '../user/user.controller.js'
import { updateYEntity } from './entity.service.js'

export async function updateEntityPost (request, { post, outRelations, transformedSystemRelations, title, rawContent }) {
  const prisma = request.server.prisma

  const session = getAuthenticatedUserSession(request)

  return await prisma.$transaction(async (tx) => {
    await updateYEntity(tx, {
      post,
      outRelations,
      systemRelations: transformedSystemRelations
    })

    /**
       * @type {PrismaTypes.YPostUpdate}
       */
    const dataToInsert = {
      title,
      content: rawContent,
      postId: post.id
    }

    return await createYPostUpdate(tx, session.user.id, dataToInsert)
  })
}
