import { NotFound } from '../../errors.js'
import { postWithContentById } from './post.service.js'

export async function postExists (request, reply) {
  const { id } = request.params

  const post = await postWithContentById(request.server.prisma, id)

  if (!post) return NotFound(reply)

  request.post = post
}
