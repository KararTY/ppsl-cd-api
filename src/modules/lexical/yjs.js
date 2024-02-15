import yjs from './yjs.cjs'
import lexicalHeadless from '@lexical/headless'
import lexicalYjs from '@lexical/yjs/LexicalYjs.js'

const Y = yjs

const { createBinding, syncYjsChangesToLexical } = lexicalYjs

const { createHeadlessEditor } = lexicalHeadless

// https://github.com/facebook/lexical/discussions/4442

/**
 * @param {Uint8Array} update
 */
export function updateToJSON (config, update) {
  const editor = createHeadlessEditor(config)

  const dummyId = 'dummy-id'
  const dummyProvider = {
    awareness: {
      setLocalState: () => {},
      getStates: () => [],
      getLocalState: () => null,
      on: () => {},
      off: () => {}
    }
  }
  const copyTarget = new Y.Doc()
  const copyBinding = createBinding(editor, dummyProvider, dummyId, copyTarget, new Map([[dummyId, copyTarget]]))

  // this syncs yjs changes to the lexical editor
  const onYjsTreeChanges = (events, transaction) => {
    syncYjsChangesToLexical(copyBinding, dummyProvider, events, false)
  }
  copyBinding.root.getSharedType().observeDeep(onYjsTreeChanges)

  // copy the original document to the copy to trigger the observer which updates the editor
  Y.applyUpdateV2(copyTarget, update)

  editor.update(() => {}, { discrete: true })

  return editor.toJSON().editorState
}

export function uint8ArrayToString (uint8Array) {
  return btoa(uint8Array)
}

export function stringToUint8Array (base64uint8Array) {
  return new Uint8Array(atob(base64uint8Array).split(','))
}

/**
 * @param {Array<PrismaTypes.YPostUpdate>} postUpdates
 */
export function postUpdatesToUint8Arr (postUpdates) {
  return postUpdates.map(({ content }) => stringToUint8Array(content))
}

/**
 * @param {Array<Uint8Array>} arrOfUint8Arr
 */
export function mergePostUpdates (arrOfUint8Arr) {
  return Y.mergeUpdatesV2(arrOfUint8Arr)
}

/**
 * @param {Uint8Array}
 */
export function getStateVectorFromUpdate (update) {
  return Y.encodeStateVectorFromUpdate(update)
}

/**
 * @param {Uint8Array} newUpdate
 * @param {Uint8Array} existingStateVector
 */
export function diffUpdateUsingStateVector (newUpdate, existingStateVector) {
  return Y.diffUpdate(newUpdate, existingStateVector)
}
