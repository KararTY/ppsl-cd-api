/**
 * @param {import("fastify").FastifyRequest} request
 * @param {import("fastify").FastifyReply} reply
 */
export async function getUser (request, reply) {
  const user = await request.server.getSession(request)

  if (!user) {
    return reply.code(401)
  }

  return user
}
