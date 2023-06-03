import { NotFound } from '../../errors.js'
import { postHistoryById } from './postHistory.service.js'

export async function postHistoryExists (request, reply) {
  const { id } = request.params

  const postHistory = await postHistoryById(request.server.prisma, id)

  if (!postHistory) return NotFound(reply)

  request.postHistory = postHistory
}
