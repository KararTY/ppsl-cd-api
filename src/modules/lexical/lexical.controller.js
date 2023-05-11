import { decode } from '@msgpack/msgpack'

import { bioEditorValidation, entityEditorValidation } from './lexical.service.js'

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 * @param {boolean} internalRequest Should only be set if you want to call it as a function and not directly by a route endpoint. Returns an object of `{ valid: boolean, content: string }`.
 */
export async function validateBioEditor (request, reply, internalRequest) {
  const body = request.body

  if (body.length === 0) return reply.status(400).send()

  let content
  try {
    content = decode(body.content.split(','))
  } catch (error) {
    return reply.status(400).send()
  }

  const valid = await bioEditorValidation(JSON.stringify(content))

  if (internalRequest) {
    return {
      valid,
      content
    }
  }

  return valid
}

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 * @param {boolean} internalRequest Should only be set if you want to call it as a function and not directly by a route endpoint. Returns an object of `{ valid: boolean, content: string }`.
 */
export async function validateEntityEditor (request, reply, internalRequest) {
  const body = request.body

  if (body.length === 0) return reply.status(400).send()

  let content
  try {
    content = decode(body.content.split(','))
  } catch (error) {
    return reply.status(400).send()
  }

  const { result, error } = await entityEditorValidation(JSON.stringify(content))

  if (internalRequest) {
    return {
      valid: result,
      error,
      content
    }
  }

  return { valid: result, error }
}
