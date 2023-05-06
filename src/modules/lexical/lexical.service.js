import lexical from 'lexical'
import lexicalHeadless from '@lexical/headless'
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
  const bioEditor = createHeadlessEditor({
    namespace: 'biovalidation',
    nodes: [],
    onError: (error) => {
      console.error(error)
    }
  })

  const nextEditorState = bioEditor.parseEditorState(stringifiedJSON)

  bioEditor.setEditorState(nextEditorState)

  bioEditor.update(() => {
    const root = $getRoot()
    sanitizeNode(root)
  })
  await Promise.resolve().then()

  return stringifiedJSON === JSON.stringify(bioEditor.getEditorState().toJSON())
}
