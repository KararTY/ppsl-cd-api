import { base64ToUint8Array, uint8ArrayToBase64 } from 'uint8array-extras'
import * as yjs from './yjs.mjs'
import * as lexicalHeadless from '@lexical/headless'
import * as lexicalYjs from '@lexical/yjs'

const { Y } = yjs

const { createBinding, syncYjsChangesToLexical, syncLexicalUpdateToYjs } =
  lexicalYjs

const { createHeadlessEditor } = lexicalHeadless

// https://github.com/facebook/lexical/discussions/4442

/**
 * @param {Uint8Array} update
 * @returns {{ editor: Lexical.LexicalEditor, doc: Y.Doc }}
 */
export function getEditor (config, update) {
  const editor = createHeadlessEditor(config)

  const dummyId = 'dummy-id'
  /** @type {import('@lexical/yjs').Provider} */
  const dummyProvider = {
    awareness: {
      setLocalState: () => {},
      // @ts-ignore
      getStates: () => [],
      getLocalState: () => null,
      on: () => {},
      off: () => {}
    }
  }
  const copyTarget = new Y.Doc()
  const copyBinding = createBinding(
    editor,
    dummyProvider,
    dummyId,
    copyTarget,
    new Map([[dummyId, copyTarget]])
  )

  // this syncs yjs changes to the lexical editor
  /** @param {Y.YEvent<any>[]} events */
  const onYjsTreeChanges = (events) => {
    syncYjsChangesToLexical(copyBinding, dummyProvider, events, false)
  }
  copyBinding.root.getSharedType().observeDeep(onYjsTreeChanges)

  // copy the original document to the copy to trigger the observer which updates the editor
  Y.applyUpdateV2(copyTarget, update)

  editor.update(() => {}, { discrete: true })

  // Enables "copyTarget"/Y.Doc to be updated when Lexical changes happen.
  editor.registerUpdateListener(
    ({
      dirtyElements,
      dirtyLeaves,
      editorState,
      normalizedNodes,
      prevEditorState,
      tags
    }) => {
      if (tags.has('skip-collab') === false) {
        syncLexicalUpdateToYjs(
          copyBinding,
          dummyProvider,
          prevEditorState,
          editorState,
          dirtyElements,
          dirtyLeaves,
          normalizedNodes,
          tags
        )
      }
    }
  )

  return { editor, doc: copyTarget }
}

/**
 * @param {YDoc} yDoc
 */
export function encodeYDocToUpdateV2 (yDoc) {
  const yjsUpdateState = Y.encodeStateAsUpdateV2(yDoc)

  return yjsUpdateState
}

/**
 * @param {Array<Prisma.YPostUpdate>} postUpdates
 */
export function postUpdatesToUint8Arr (postUpdates) {
  return postUpdates.map(({ content }) => base64ToUint8Array(content))
}

/**
 * @param {Array<Uint8Array>} arrOfUint8Arr
 */
export function mergePostUpdates (arrOfUint8Arr) {
  return Y.mergeUpdatesV2(arrOfUint8Arr)
}

/**
 * @param {Uint8Array} update
 */
export function getStateVectorFromUpdate (update) {
  return Y.encodeStateVectorFromUpdateV2(update)
}

/**
 * @param {Uint8Array} newUpdate
 * @param {Uint8Array} existingStateVector
 */
export function diffUpdateUsingStateVector (newUpdate, existingStateVector) {
  return Y.diffUpdateV2(newUpdate, existingStateVector)
}

/**
 * @param {Array<Prisma.YPostUpdate>} postUpdates
 */
export function yPostUpdatesToBase64 (postUpdates) {
  const uint8ArrayArray = postUpdatesToUint8Arr(postUpdates)
  const mergedUpdates = mergePostUpdates(uint8ArrayArray)
  const base64String = uint8ArrayToBase64(mergedUpdates)

  return base64String
}
