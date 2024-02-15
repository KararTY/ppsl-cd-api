import { InvalidEditor } from '../../errors.js'

import { postWithPostUpdatesByPostId } from '../post/postHistory.service.js'

import { entityConfig } from './ppsl-cd-lexical-shared/src/editors/Entity/config.js'
import { bioConfig } from './ppsl-cd-lexical-shared/src/editors/Bio/config.js'
import toHTML from './ppsl-cd-lexical-shared/src/toHTML/index.js'
import { SYSTEM_IDS } from './ppsl-cd-lexical-shared/src/editors/constants.js'
import { bioEditorValidation, entityEditorValidation } from './lexical.service.js'
import { mergePostUpdates, postUpdatesToUint8Arr, updateToJSON } from './yjs.js'

const { ENTITY, BIO, REVIEW } = SYSTEM_IDS

const validator = {
  [ENTITY]: {
    config: entityConfig({}, null),
    validate: entityEditorValidation
  },
  [BIO]: {
    config: bioConfig({}, null),
    validate: bioEditorValidation
  },
  [REVIEW]: {
    config: bioConfig({}, null),
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

  let content
  try {
    content = updateToJSON(entityConfig({}, null), new Uint8Array(atob(body.content).split(',')))

    // get existing data for document (and then run Y.mergeUpdatesV2 or forEach update applyUpdateV2)
    // Y.applyUpdateV2(content, new Uint8Array(atob(body.content).split(',')))
    // body.content should be compared to the existing data on the database.
  } catch (error) {
    return reply.status(400).send()
  }

  const { result, error } = await entityEditorValidation(JSON.stringify(content))

  if (internalRequest) {
    return {
      valid: result,
      error,
      rawContent: body.content,
      content
    }
  }

  return { valid: result, error }
}

/**
 * @param {{ type: string, update: Uint8Array | string }}
 * @param {Fastify.Reply} reply
 */
export async function validateEditor ({ type, update }, reply) {
  const { config, validate } = validator[type]

  let parsedUpdate
  if (typeof update === 'string') {
    parsedUpdate = new Uint8Array(atob(update).split(','))
  } else {
    parsedUpdate = update
  }

  let content
  try {
    content = updateToJSON(config, parsedUpdate)
  } catch (error) {
    return reply.status(400).send()
  }

  const { result, error } = await validate(JSON.stringify(content))

  return {
    valid: result,
    error,
    content
  }
}

/**
 * @param {Fastify.Request} request
 * @param {Fastify.Reply} reply
 */
export async function lexicalHTMLTransform (request, reply) {
  const { id } = request.params

  const post = await postWithPostUpdatesByPostId(request.server.prisma, id)

  const systemRelations = post.outRelations

  const entity = systemRelations.some((sysRelation) => sysRelation.toPostId === ENTITY) && ENTITY
  const bio = systemRelations.some((sysRelation) => sysRelation.toPostId === BIO) && BIO
  const review = systemRelations.some((sysRelation) => sysRelation.toPostId === REVIEW) && REVIEW

  const { config } = validator[entity || bio || review]

  const update = mergePostUpdates(postUpdatesToUint8Arr(post.postUpdates))
  const editorState = updateToJSON(config, update)

  return await toHTML(JSON.stringify(editorState), entity || bio || review)
}
