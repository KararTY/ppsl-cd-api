import { allPostsPaginated, postById, postByPostId } from './post.service'

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function getPosts (request, reply) {
  const { cursor } = request.query
  const res = await allPostsPaginated(request.server.prisma, cursor)

  if (res.length === 0) {
    return {
      result: [],
      cursor
    }
  }

  return {
    result: res,
    cursor: res[res.length - 1].id
  }
}

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function getPostById (request, reply) {
  const { id } = request.params
  const res = await postById(request.server.prisma, id)

  if (!res) return reply.code(404).send({ error: 'Not found' })

  return res
}

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function getPostByPostId (request, reply) {
  const { postId } = request.params

  const res = await postByPostId(request.server.prisma, postId)

  if (!res) return reply.code(404).send({ error: 'Not found' })

  return res
}

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
// export async function postPost (request, reply) {
//   const { postId } = request.params
//
//   const body = {
//     ...request.body,
//     postId
//   }
//
//   const { id } = await request.server.prisma.post.create({
//     data: body
//   })
//
//   return {
//     id,
//     postId
//   }
// }
