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

import _ from 'lodash'

import request from '../ipc/Request'
import FileConstants from 'shared/constants/ipc/FileConstants'
const {
  GET_FILE_DATA,
} = FileConstants

import DecoChangeFactory from '../factories/editor/DecoChangeFactory'
import DecoRange from '../models/editor/DecoRange'
import DecoRangeUtils from '../utils/editor/DecoRangeUtils'
import DecoComponentUtils from '../utils/editor/DecoComponentUtils'
import LiveValueUtils from '../utils/metadata/LiveValueUtils'
import LiveValueGroupUtils from '../utils/metadata/LiveValueGroupUtils'
import uuid from '../utils/uuid'
import { markSaved } from './fileActions'
import { createHistory, addToHistory, undoFromHistory, redoToHistory } from './historyActions'
import { setLiveValueIds, createLiveValue, setLiveValues, importLiveValues } from './liveValueActions'
import { loadMetadata } from './metadataActions'
import { save, saveLive } from './applicationActions'
import { CATEGORIES, PREFERENCES } from 'shared/constants/PreferencesConstants'

export const CLEAR_EDITOR_STATE = 'CLEAR_EDITOR_STATE'
export const clearEditorState = () => {
  return {
    type: CLEAR_EDITOR_STATE,
  }
}

export const SET_CURRENT_DOC = 'SET_CURRENT_DOC'
export const setCurrentDoc = (id) => {
  return {
    type: SET_CURRENT_DOC,
    id: id,
  }
}
export const clearCurrentDoc = () => {
  return {
    type: SET_CURRENT_DOC,
    id: null,
  }
}

export const CACHE_DOC = 'CACHE_DOC'
export const _cacheDoc = (payload, decoRanges) => {
  return {
    type: CACHE_DOC,
    id: payload.id,
    data: payload.utf8Data,
    decoRanges,
  }
}

//TODO switch onFileData to request format so we can move the action / dispatch chaining up to containers.
//TODO these kinds of functions could possibly be removed into a separate action file
export function cacheDoc(payload) {
  return (dispatch, getState) => {
    const cache = getState().editor.docCache
    const dirtyList = getState().editor.dirtyList
    if (_.has(cache, payload.id)) {
      const decoDoc = cache[payload.id]

      // TODO clear metadata and ranges, then re-add?
      if (decoDoc.decoRanges.length > 0) {
        return
      }

      // if this data is new
      if (decoDoc.code !== payload.utf8Data) {
        // if the document hasn't been edited since last save
        if (!_.has(dirtyList, payload.id)) {
          // overwrite
          decoDoc.code = payload.utf8Data
          dispatch(markClean(payload.id))
          dispatch(markSaved(payload.id))
        }
      }
    //nothing in the cache, we create the doc
    } else {
      dispatch(loadMetadata(payload.id)).then((metadata) => {
        const {decoRanges, liveValueIds, liveValuesById} = metadata.liveValues
        dispatch(setLiveValues(payload.id, liveValueIds, liveValuesById))
        dispatch(_cacheDoc(payload, decoRanges))
        dispatch(createHistory(payload.id))
      }).catch((err) => {
        if (err.code === 'ENOENT') {
          dispatch(_cacheDoc(payload, []))
          dispatch(createHistory(payload.id))
        } else {
          console.error(`Error reading metadata for ${payload.id}`)
        }
      })
    }
  }
}


//TODO actually use change generation correctly
export const MARK_DIRTY = 'MARK_DIRTY'
export const markDirty = (id) => {
  return {
    type: MARK_DIRTY,
    id: id,
  }
}

export const MARK_CLEAN = 'MARK_CLEAN'
export const markClean = (id) => {
  return {
    type: MARK_CLEAN,
    id: id,
  }
}

const getCachedDecoDoc = (cache, id) => {
  const decoDoc = cache[id]
  if (! decoDoc) {
    throw new Error("Failed to operate on decoDoc, decoDoc wasn't in cache!")
  }
  return decoDoc
}

let _saveLiveDebounced = null
let _debounceDelay = null
const saveLiveDebounced = (dispatch, delay) => {
  if (delay !== _debounceDelay) {
    _debounceDelay = delay
    _saveLiveDebounced = _.debounce(() => {
      dispatch(saveLive())
    }, delay)
  }

  _saveLiveDebounced()
}

const conditionalSaveLive = (dispatch, savingPreferences) => {
  if (savingPreferences[PREFERENCES.SAVING.AUTOSAVE] &&
      savingPreferences[PREFERENCES.SAVING.TEXT_EDIT]) {
    const delay = savingPreferences[PREFERENCES.SAVING.DEBOUNCE]
    saveLiveDebounced(dispatch, delay)
  }
}

function setLiveValuesForDoc(fileId, decoDoc) {
  const liveValueIds = _.map(decoDoc.decoRanges, 'id')
  return setLiveValueIds(fileId, liveValueIds)
}

export const OPERATION_EDIT = 'OPERATION_EDIT'
export function edit(id, decoChange) {
  return (dispatch, getState) => {
    const state = getState()
    const decoDoc = getCachedDecoDoc(state.editor.docCache, id)

    // Get the code for all ranges, pre-edit
    const initialCodeForRanges = decoDoc.getCodeForDecoRanges()

    decoDoc.edit(decoChange)

    // Get the code for all ranges, post-edit, and see if types differ
    const updatedCodeForRanges = decoDoc.getCodeForDecoRanges()
    const rangesWithModifiedTokenTypes = DecoRangeUtils.findRangesWithModifiedTokenTypes(
      initialCodeForRanges,
      decoDoc.decoRanges,
      updatedCodeForRanges
    )

    // If types of ranges differ after the edit
    if (rangesWithModifiedTokenTypes.length > 0) {

      // Remove these ranges
      const removeBrokenRanges = DecoChangeFactory.createChangeToRemoveDecoRanges(
        rangesWithModifiedTokenTypes
      )

      decoDoc.edit(removeBrokenRanges)

      // Combine both the text change and the range removal into one change
      const combinedChange = DecoChangeFactory.createCompositeChange([
        decoChange,
        removeBrokenRanges,
      ])

      dispatch(addToHistory(id, combinedChange))
    } else {
      dispatch(addToHistory(id, decoChange))
    }

    dispatch(setLiveValuesForDoc(id, decoDoc))
    conditionalSaveLive(dispatch, state.preferences[CATEGORIES.SAVING])
  }
}
export const OPERATION_UNDO = 'OPERATION_UNDO'
export function undo(id) {
  return (dispatch, getState) => {
    const state = getState()
    const history = state.history[id]

    if (history.canUndo()) {
      const decoChange = history.getUndoStackTop()
      const invertedChange = decoChange.invert()
      const decoDoc = getCachedDecoDoc(state.editor.docCache, id)

      decoDoc.edit(invertedChange)

      dispatch(undoFromHistory(id))
      dispatch(setLiveValuesForDoc(id, decoDoc))
      conditionalSaveLive(dispatch, state.preferences[CATEGORIES.SAVING])
    }
  }
}

export const OPERATION_REDO = 'OPERATION_REDO'
export function redo(id) {
  return (dispatch, getState) => {
    const state = getState()
    const history = state.history[id]

    if (history.canRedo()) {
      const decoChange = history.getRedoStackTop()
      const decoDoc = getCachedDecoDoc(state.editor.docCache, id)

      decoDoc.edit(decoChange)

      dispatch(redoToHistory(id))
      dispatch(setLiveValuesForDoc(id, decoDoc))
      conditionalSaveLive(dispatch, state.preferences[CATEGORIES.SAVING])
    }
  }
}

export const SET_TEXT_FOR_RANGE = 'SET_TEXT_FOR_RANGE'
export const setTextForDecoRange = (fileId, decoRangeId, text) => {
  return (dispatch, getState) => {
    const state = getState()
    const cache = state.editor.docCache
    const decoDoc = getCachedDecoDoc(cache, fileId)

    const decoRange = decoDoc.getDecoRange(decoRangeId)
    const originalCode = decoDoc.getCodeForDecoRange(decoRangeId)

    const decoChange = DecoChangeFactory.createChangeToSetText(
      decoRange.from,
      decoRange.to,
      text,
      originalCode
    )

    dispatch(edit(fileId, decoChange))

    if (state.preferences[CATEGORIES.SAVING][PREFERENCES.SAVING.AUTOSAVE] &&
        state.preferences[CATEGORIES.SAVING][PREFERENCES.SAVING.PROPERTY_CHANGE]) {
      dispatch(saveLive())
    }
  }
}

const _getComponentMetadata = (componentInfo, state) => {
  if (!componentInfo.module) {
    return state.metadata.components.localComponents[componentInfo.name]
  } else {
    return state.metadata.components.coreComponents[componentInfo.name]
  }
}

export const insertComponent = (componentInfo, decoDoc) => {
  return (dispatch, getState) => {
    const metadata = _getComponentMetadata(componentInfo, getState())
    const {decoRanges, liveValuesById} = LiveValueUtils.normalizeLiveValueMetadata(metadata.liveValues)

    dispatch(importLiveValues(decoDoc.id, liveValuesById))

    const insertChange = DecoComponentUtils.createChangeToInsertComponent(
      componentInfo,
      metadata,
      decoDoc,
      decoRanges
    )

    dispatch(edit(decoDoc.id, insertChange))
  }
}

export const insertTemplate = (decoDoc, text, metadata = {}, imports, groupName) => (dispatch, getState) => {

  let liveValues = metadata.liveValues || []

  // TODO: Add groups better
  if (groupName) {
    liveValues = LiveValueGroupUtils.setLiveValueGroupsFromImportName(
      liveValues,
      groupName,
      getState().metadata.liveValues,
      decoDoc.id
    )
  }

  const {decoRanges, liveValuesById} = LiveValueUtils.normalizeLiveValueMetadata(liveValues)

  dispatch(importLiveValues(decoDoc.id, liveValuesById))

  const insertChange = DecoComponentUtils.createChangeToInsertTemplate(
    decoDoc,
    text,
    decoRanges
  )

  dispatch(edit(decoDoc.id, insertChange))

  // Add each import separately, as each import will change the line numbers of
  // subsequent imports. History events are merged based on timestamp, so they
  // will still become one event.
  _.each(imports, (importValue, importKey) => {
    const importChange = DecoComponentUtils.createChangeToInsertImport(
      decoDoc,
      importKey,
      importValue
    )
    dispatch(edit(decoDoc.id, importChange))
  })
}

export const ADD_DECO_RANGE = 'ADD_DECO_RANGE'
export const addDecoRangeFromCMToken = (id, cmToken) => {
  return (dispatch, getState) => {
    const decoDoc = getCachedDecoDoc(getState().editor.docCache, id)
    const existingDecoRange = decoDoc.getDecoRangeForCMPos(cmToken.from, true)

    let decoChange

    if (existingDecoRange) {
      decoChange = DecoChangeFactory.createChangeToRemoveDecoRange(existingDecoRange)
    } else {

      // Construct decoChange from cmToken
      const decoRangeId = uuid()
      const decoRange = new DecoRange(decoRangeId, cmToken.from, cmToken.to)
      decoChange = DecoChangeFactory.createChangeToAddDecoRange(decoRange)

      const rangeName = DecoRangeUtils.guessDecoRangeName(decoDoc, decoRange)
      const text = decoDoc.cmDoc.getRange(decoRange.from, decoRange.to)

      ga('send', {
        hitType: 'event',
        eventCategory: 'LiveValue',
        eventAction: 'create',
        eventValue: text,
      })

      dispatch(createLiveValue(id, decoRangeId, text, rangeName, cmToken.type))
    }

    decoDoc.edit(decoChange)
    dispatch(addToHistory(id, decoChange))

    dispatch(setLiveValuesForDoc(id, decoDoc))
  }
}

export const DOC_ID_CHANGE = 'DOC_ID_CHANGE'
export const docIdChange = (oldId, newId) => {
  return {
    type: DOC_ID_CHANGE,
    oldId,
    newId,
  }
}

function _getFileData(path) {
  return {
    type: GET_FILE_DATA,
    path,
  }
}
export function openDocument(fileInfo) {
  return (dispatch, getState) => {
    const state = getState()
    if (state.editor && state.editor.docCache && state.editor.docCache[fileInfo.id]) {
      dispatch(setCurrentDoc(fileInfo.id))
      return Promise.resolve()
    } else {
      return request(_getFileData(fileInfo.absolutePath)).then((payload) => {
        dispatch(cacheDoc(payload))
        dispatch(setCurrentDoc(payload.id))
      })
    }
  }
}
