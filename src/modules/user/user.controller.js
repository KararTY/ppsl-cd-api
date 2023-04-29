/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function getAuthenticatedUser (request, reply) {
  return request.session
}
