import { uint8ArrayToBase64 } from 'uint8array-extras'
import * as lexical from 'lexical'

import { $isEntityContainerNode } from './ppsl-cd-lexical-shared/src/editors/plugins/EntityContainer/node.js'
import {
  INSERT_ENTITYCONTAINER_COMMAND,
  registerInsertEntityContainerCommand
} from './ppsl-cd-lexical-shared/src/editors/plugins/EntityContainer/commands.js'
import { $isEntityImageNode } from './ppsl-cd-lexical-shared/src/editors/plugins/EntityImage/node.js'
import { $isEntityShortDescriptionNode } from './ppsl-cd-lexical-shared/src/editors/plugins/EntityShortDescription/node.js'
import { $isEntityLongDescriptionNode } from './ppsl-cd-lexical-shared/src/editors/plugins/EntityLongDescription/node.js'
import { EntityMentionNode } from './ppsl-cd-lexical-shared/src/editors/plugins/EntityMention/node.js'
import { SYSTEM_IDS } from './ppsl-cd-lexical-shared/src/editors/constants.js'
import { entityConfig } from './ppsl-cd-lexical-shared/src/editors/Entity/config.js'
import { bioConfig } from './ppsl-cd-lexical-shared/src/editors/Bio/config.js'
import { getEditor } from './yjs.js'
import * as yjs from './yjs.mjs'

const { Y } = yjs

const {
  $getRoot,
  $isElementNode,
  $createParagraphNode,
  $isParagraphNode,
  ParagraphNode,
  $nodesOfType
} = lexical

const { ENTITY, BIO, REVIEW } = SYSTEM_IDS
const configs = {
  [ENTITY]: entityConfig(null, false, null),
  [BIO]: bioConfig(null, false, null),
  [REVIEW]: bioConfig(null, false, null)
}

/**
 * @param {Lexical.LexicalEditor} editor
 * @param {Lexical.LexicalNode} node
 */
const sanitizeNode = (editor, node) => {
  if ($isElementNode(node)) {
    const children = node.getChildren()
    for (const child of children) {
      sanitizeNode(child)
    }
  }
}

/**
 * @param {Lexical.LexicalEditor} editor
 * @param {Lexical.LexicalNode} node
 */
const onlyTextNodes = (editor, children) => {
  for (let index = 0; index < children.length; index++) {
    const node = children[index]
    if ($isElementNode(node) && !$isParagraphNode(node)) {
      if (node.getChildrenSize() > 1) {
        onlyTextNodes(editor, node.getChildren())
      }

      node.replace($createParagraphNode(), true)
    }
  }
}

/**
 * @param {Lexical.LexicalEditor} editor
 */
export async function bioEditorValidation (editor, stringifiedJSON) {
  editor.registerNodeTransform(ParagraphNode, (node) => {
    const parent = node.getParent()

    if (parent instanceof ParagraphNode) {
      const children = node.getChildren()
      parent.append(...children)

      node.remove() // Removing makes sure that this transform doesn't run again and creating an infinite loop.
    }
  })

  editor.read(() => {
    const root = $getRoot()
    sanitizeNode(editor, root)
  })

  await Promise.resolve().then()

  return stringifiedJSON === JSON.stringify(editor.getEditorState().toJSON())
}

/**
 * @param {Lexical.LexicalEditor} editor
 */
const validateEntityEditor = (editor) => {
  return new Promise((resolve, reject) => {
    editor.read(() => {
      const root = $getRoot()
      sanitizeNode(editor, root)

      // Make sure last child is entity-container
      const entityContainer = root.getLastChild()
      if (!$isEntityContainerNode(entityContainer)) {
        throw new Error(
          `First child is "${entityContainer.getType()}" and not "entity-container".`
        )
      }

      // Make sure root only has one child.
      if (root.getChildrenSize() > 1) {
        throw new Error('Root has too many children.')
      }

      // Make sure first child of entity-container is entity-image
      const entityImage = entityContainer.getFirstChild()
      if (!$isEntityImageNode(entityImage)) {
        throw new Error(
          `First child of "entity-container" is "${entityImage.getType()}" and not "entity-image".`
        )
      }

      // Make sure second child of entity-container is entity-short-description
      const entityShortDescription = entityContainer.getChildAtIndex(1)
      if (!$isEntityShortDescriptionNode(entityShortDescription)) {
        throw new Error(
          `Second child of "entity-container" is "${entityImage.getType()}" and not "entity-short-description".`
        )
      }

      onlyTextNodes(editor, entityShortDescription.getChildren())

      // Make sure last child of entity-container is entity-long-description
      const entityLongDescription = entityContainer.getLastChild()
      if (!$isEntityLongDescriptionNode(entityLongDescription)) {
        throw new Error(
          `Last child of "entity-container" is "${entityImage.getType()}" and not "entity-long-description".`
        )
      }

      onlyTextNodes(editor, entityLongDescription.getChildren())

      resolve(editor)
    })
  })
}

/**
 * @param {Lexical.LexicalEditor} editor
 */
export const entityEditorValidation = async (editor, stringifiedJSON) => {
  try {
    const entityEditor = await validateEntityEditor(editor)
    const res = JSON.stringify(entityEditor.getEditorState().toJSON())
    return { result: stringifiedJSON === res, error: null }
  } catch (error) {
    return { result: false, error: error.message }
  }
}

/**
 * @param {Lexical.LexicalEditor} editor
 * @returns {Promise<string[]>}
 */
export const getEntityMentions = (editor) => {
  return new Promise((resolve, reject) => {
    editor.read(() => {
      const entityMentions = $nodesOfType(EntityMentionNode)

      const postIds = entityMentions.map((node) => node.getPostId())

      resolve(postIds)
    })
  })
}

export const defaultUpdate = {
  [ENTITY]: (() => {
    let emptyUpdate

    {
      const yDoc = new Y.Doc()
      yDoc.get('root', Y.XmlText)
      emptyUpdate = Y.encodeStateAsUpdateV2(yDoc)
    }

    const config = configs[ENTITY]

    const { editor, doc } = getEditor(config, emptyUpdate)

    registerInsertEntityContainerCommand(editor)

    editor.update(
      () => {
        editor.dispatchCommand(INSERT_ENTITYCONTAINER_COMMAND)
      },
      { discrete: true }
    )

    const base64 = uint8ArrayToBase64(Y.encodeStateAsUpdateV2(doc))

    return base64
  })(),
  [BIO]: (() => {
    let emptyUpdate

    {
      const yDoc = new Y.Doc()
      yDoc.get('root', Y.XmlText)
      emptyUpdate = Y.encodeStateAsUpdateV2(yDoc)
    }
    const config = configs[BIO]

    const { editor, doc } = getEditor(config, emptyUpdate)

    editor.update(() => {}, { discrete: true })

    const base64 = uint8ArrayToBase64(Y.encodeStateAsUpdateV2(doc))

    return base64
  })(),
  [REVIEW]: (() => {
    let emptyUpdate

    {
      const yDoc = new Y.Doc()
      yDoc.get('root', Y.XmlText)
      emptyUpdate = Y.encodeStateAsUpdateV2(yDoc)
    }

    const config = configs[REVIEW]

    const { editor, doc } = getEditor(config, emptyUpdate)

    editor.update(() => {}, { discrete: true })

    const base64 = uint8ArrayToBase64(Y.encodeStateAsUpdateV2(doc))

    return base64
  })()
}
