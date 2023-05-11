import lexical from 'lexical'
import lexicalHeadless from '@lexical/headless'
import { bioConfig } from './ppsl-cd-lexical-shared/src/editors/Bio/config'
import { defaultTheme, readOnlyTheme } from './ppsl-cd-lexical-shared/src/editors/theme'
import { entityConfig } from './ppsl-cd-lexical-shared/src/editors/Entity/config'
import { $isEntityContainerNode } from './ppsl-cd-lexical-shared/src/editors/plugins/EntityContainer/node'
import { $isEntityImageNode } from './ppsl-cd-lexical-shared/src/editors/plugins/EntityImage/node'
import { $isEntityShortDescriptionNode } from './ppsl-cd-lexical-shared/src/editors/plugins/EntityShortDescription/node'
import { $isEntityLongDescriptionNode } from './ppsl-cd-lexical-shared/src/editors/plugins/EntityLongDescription/node'

const { $getRoot, $isElementNode, $createParagraphNode, $isParagraphNode, ParagraphNode } = lexical
const { createHeadlessEditor } = lexicalHeadless

/**
 * @param {import('lexical').LexicalEditor} editor
 * @param {import('lexical').LexicalNode} node
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
 * @param {import('lexical').LexicalEditor} editor
 * @param {import('lexical').LexicalNode} node
 */
const onlyTextNodes = (editor, children) => {
  for (let index = 0; index < children.length; index++) {
    const node = children[index]
    if ($isElementNode(node) && !$isParagraphNode(node)) {
      node.replace($createParagraphNode(), true)
    }
  }
}

export async function bioEditorValidation (stringifiedJSON) {
  const theme = { ...defaultTheme, ...readOnlyTheme }
  const config = bioConfig(theme, undefined, (error) => {
    console.error(error)
  })
  const bioEditor = createHeadlessEditor(config)

  const nextEditorState = bioEditor.parseEditorState(stringifiedJSON)

  bioEditor.setEditorState(nextEditorState)

  bioEditor.registerNodeTransform(ParagraphNode, (node) => {
    const parent = node.getParent()

    if (parent instanceof ParagraphNode) {
      const children = node.getChildren()
      parent.append(...children)

      node.remove() // Removing makes sure that this transform doesn't run again and creating an infinite loop.
    }
  })

  bioEditor.update(() => {
    const root = $getRoot()
    sanitizeNode(bioEditor, root)
  }, { discrete: true })
  await Promise.resolve().then()

  return stringifiedJSON === JSON.stringify(bioEditor.getEditorState().toJSON())
}

function validateEntityEditor (stringifiedJSON) {
  return new Promise((resolve, reject) => {
    const theme = { ...defaultTheme, ...readOnlyTheme }
    const config = entityConfig(theme, undefined, (error) => {
      console.error(error)
      reject(error)
    })

    const entityEditor = createHeadlessEditor(config)

    const nextEditorState = entityEditor.parseEditorState(stringifiedJSON)
    entityEditor.setEditorState(nextEditorState)

    entityEditor.update(() => {
      const root = $getRoot()
      sanitizeNode(entityEditor, root)

      // Make sure last child is entity-container
      const entityContainer = root.getLastChild()
      if (!$isEntityContainerNode(entityConfig)) {
        throw new Error(`First child is "${entityContainer.getType()}" and not "entity-container".`)
      }

      // Make sure root only has one child.
      if (root.getChildrenSize() > 1) {
        throw new Error('Root has too many children.')
      }

      // Make sure first child of entity-container is entity-image
      const entityImage = entityContainer.getFirstChild()
      if (!$isEntityImageNode(entityImage)) {
        throw new Error(`First child of "entity-container" is "${entityImage.getType()}" and not "entity-image".`)
      }

      // Make sure second child of entity-container is entity-short-description
      const entityShortDescription = entityContainer.getChildAtIndex(1)
      if (!$isEntityShortDescriptionNode(entityShortDescription)) {
        throw new Error(`Second child of "entity-container" is "${entityImage.getType()}" and not "entity-short-description".`)
      }

      onlyTextNodes(entityEditor, entityShortDescription.getChildren())

      // Make sure last child of entity-container is entity-long-description
      const entityLongDescription = entityContainer.getLastChild()
      if (!$isEntityLongDescriptionNode(entityLongDescription)) {
        throw new Error(`Last child of "entity-container" is "${entityImage.getType()}" and not "entity-long-description".`)
      }

      onlyTextNodes(entityEditor, entityLongDescription.getChildren())

      resolve(entityEditor)
    })
  })
}

export async function entityEditorValidation (stringifiedJSON) {
  try {
    const entityEditor = await validateEntityEditor(stringifiedJSON)
    const res = JSON.stringify(entityEditor.getEditorState().toJSON())
    return { result: stringifiedJSON === res }
  } catch (error) {
    return { result: false, error: error.message }
  }
}
