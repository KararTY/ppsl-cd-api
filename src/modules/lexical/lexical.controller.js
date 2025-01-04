import { base64ToUint8Array } from 'uint8array-extras'

import { InvalidEditor } from '../../errors.js'

import { entityConfig } from './ppsl-cd-lexical-shared/src/editors/Entity/config.js'
import { bioConfig } from './ppsl-cd-lexical-shared/src/editors/Bio/config.js'
import { SYSTEM_IDS } from './ppsl-cd-lexical-shared/src/editors/constants.js'
import { bioEditorValidation, entityEditorValidation } from './lexical.service.js'
import { getEditor } from './yjs.js'

const { ENTITY, BIO, REVIEW } = SYSTEM_IDS

const validator = {
  [ENTITY]: {
    config: entityConfig(null, false, null),
    validate: entityEditorValidation
  },
  [BIO]: {
    config: bioConfig(null, false, null),
    validate: bioEditorValidation
  },
  [REVIEW]: {
    config: bioConfig(null, false, null),
    validate: bioEditorValidation
  }
}

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 * @param {boolean} internalRequest Should only be set if you want to call it as a function and not directly by a route endpoint. Returns an object of `{ valid: boolean, content: string }`.
 */
export async function validateBioEditor (request, reply, internalRequest) {
  const body = request.body

  if (body.length === 0) return InvalidEditor(reply)

  let content
  try {
    content = body.content
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
  const { body } = request

  if (body.length === 0) return InvalidEditor(reply)

  let editor
  /** @type {import('yjs').Doc} */
  let doc
  let content
  try {
    const data = getEditor(entityConfig(null, false, null), base64ToUint8Array(body.content))
    editor = data.editor
    doc = data.doc
    content = editor.getEditorState().toJSON()
  } catch (error) {
    return reply.status(400).send()
  }

  const stringifiedJSON = JSON.stringify(content)
  const { result, error } = await entityEditorValidation(editor, stringifiedJSON)

  if (internalRequest) {
    return {
      valid: result,
      error,
      rawContent: body.content,
      content,
      editor,
      doc
    }
  }

  return { valid: result, error }
}

/**
 * @param {{ type: string, update: Uint8Array | string }}
 * @param {Fastify.Reply} reply
 * @param {boolean} internalRequest
 */
export async function validateUpdate ({ type, update }, reply, internalRequest) {
  const { config, validate } = validator[type]

  let parsedUpdate
  if (typeof update === 'string') {
    parsedUpdate = base64ToUint8Array(update)
  } else {
    parsedUpdate = update
  }

  let editor
  let doc
  let content
  try {
    const data = getEditor(config, parsedUpdate)
    editor = data.editor
    doc = data.doc
    content = editor.getEditorState().toJSON()
  } catch (error) {
    return reply.status(400).send()
  }

  const stringifiedJSON = JSON.stringify(content)
  const { result, error } = await validate(editor, stringifiedJSON)

  const response = {
    valid: result,
    error,
    content
  }

  if (internalRequest) {
    return {
      ...response,
      editor,
      doc
    }
  }

  return response
}
