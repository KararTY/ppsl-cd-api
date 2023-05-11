import lexical from 'lexical'
import lexicalHeadless from '@lexical/headless'
import { bioConfig } from './ppsl-cd-lexical-shared/src/editors/Bio/config'
import { defaultTheme, readOnlyTheme } from './ppsl-cd-lexical-shared/src/editors/theme'

const { $getRoot, $isElementNode } = lexical
const { createHeadlessEditor } = lexicalHeadless

/**
 * @param {import('lexical').LexicalNode} node
 */
const sanitizeNode = (node) => {
  if ($isElementNode(node)) {
    const children = node.getChildren()
    for (const child of children) {
      sanitizeNode(child)
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

  bioEditor.update(() => {
    const root = $getRoot()
    sanitizeNode(root)
  })
  await Promise.resolve().then()

  return stringifiedJSON === JSON.stringify(bioEditor.getEditorState().toJSON())
}
