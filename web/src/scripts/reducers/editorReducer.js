/**
 *    Copyright (C) 2015 Deco Software Inc.
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Affero General Public License, version 3,
 *    as published by the Free Software Foundation.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import update from 'react-addons-update'

import { editorConstants as at } from '../actions'
import DecoDoc from '../models/editor/DecoDoc'

const initialState = {
  dirtyList: {},
  docCache: {},
  openDocId: null,
}

const editorReducer = (state = initialState, action) => {
  const {type, payload} = action

  switch (type) {

    case at.CLEAR_EDITOR_STATE: {
      return initialState
    }

    case at.SET_CURRENT_DOC: {
      const {id} = payload
      return {...state, openDocId: id}
    }

    case at.DOC_ID_CHANGE: {
      let {openDocId, docCache} = state
      const {oldId, newId} = payload

      // Replace the portion of the filename that overlaps
      if (openDocId && openDocId.includes(oldId)) {
        openDocId = openDocId.replace(oldId, newId)
      }

      // If this is a cached file, replace it in the cache
      if (docCache[oldId]) {

        // Update the id on the decoDoc
        const decoDoc = docCache[oldId]
        decoDoc.id = newId

        return update(state, {
          openDocId: {$set: openDocId},
          docCache: {
            [newId]: {$set: decoDoc},
            [oldId]: {$set: null},
          }
        })
      } else {

        // If a folder was renamed, potentially update children.
        // Build an object to merge into the existing docCache.
        const merge = Object.keys(docCache).reduce((updates, oldChildId) => {
          const decoDoc = docCache[oldChildId]

          if (decoDoc && oldChildId.includes(oldId)) {
            const newChildId = oldChildId.replace(oldId, newId)
            decoDoc.id = newChildId

            updates[oldChildId] = null
            updates[newChildId] = decoDoc
          }
        }, {})

        return update(state, {
          openDocId: openDocId,
          docCache: {$merge: merge},
        })
      }
    }

    case at.CACHE_DOC: {
      const {docCache} = state
      const {id, code, decoRanges} = payload

      if (docCache[id]) {
        return state
      } else {
        return update(state, {
          docCache: {
            [id]: {$set: new DecoDoc(id, code, 'jsx', decoRanges)},
          }
        })
      }
    }

    case at.MARK_DIRTY: {
      const {docCache, dirtyList} = state
      const {id} = payload

      if (docCache[id] && !dirtyList[id]) {
        return update(state, {
          dirtyList: {
            [id]: {$set: true},
          }
        })
      }

      return state
    }

    case at.MARK_CLEAN: {
      const {docCache, dirtyList} = state
      const {id} = payload

      if (docCache[id] && dirtyList[id]) {

        // Reset CodeMirror dirty state
        const decoDoc = docCache[id]
        decoDoc.markClean()

        return update(state, {
          dirtyList: {
            [id]: {$set: false},
          }
        })
      }

      return state
    }

    default: {
      return state
    }
  }
}

export default editorReducer
