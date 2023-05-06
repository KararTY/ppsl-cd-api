import { decode } from '@msgpack/msgpack'

import { bioEditorValidation } from './lexical.service.js'

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function validateBioEditor (request, reply) {
  const body = request.body

  if (body.length === 0) return reply.status(400).send()

  let bio
  try {
    bio = decode(body.bio.split(','))
  } catch (error) {
    return reply.status(400).send()
  }

  const valid = await bioEditorValidation(JSON.stringify(bio))

  return valid
}
