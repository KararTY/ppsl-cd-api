import { userById } from './user.service.js'

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function getAuthenticatedUser (request, reply) {
  return request.session
}

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function getUserById (request, reply) {
  const { id } = request.params

  const res = await userById(request.server.prisma, id)

  if (!res) return reply.callNotFound()

  return res
}
