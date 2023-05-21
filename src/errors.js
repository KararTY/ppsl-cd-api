import fastify from 'fastify'
const { errorCodes: errors } = fastify

export default errors

/**
 * @param {Fastify.Reply} reply
 */
export function NotFound (reply) {
  return reply.status(404).send(errors.FST_ERR_NOT_FOUND())
}

/**
 * @param {Fastify.Reply} reply
 */
export function InvalidEditor (reply) {
  return reply.status(400).send({ message: 'Editor content was invalid.' }) // Content was invalid.
}

/**
 * @param {Fastify.Reply} reply
 */
export function NoValidationAvailable (reply) {
  return reply.status(400).send({ message: 'no validation available for this post' })
}

/**
 * @param {Fastify.Reply} reply
 */
export function MissingTitle (reply) {
  return reply.status(400).send({ message: 'title property missing or empty' })
}

/**
 * @param {Fastify.Reply} reply
 */
export function NoPermissions (reply) {
  return reply.status(403).send({ message: 'lacking permissions' })
}
