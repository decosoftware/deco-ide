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
import * as fileActions from './fileActions'
import * as historyActions from './historyActions'
import * as liveValueActions from './liveValueActions'
import * as metadataActions from './metadataActions'
import * as applicationActions from './applicationActions'
import { CATEGORIES, PREFERENCES } from 'shared/constants/PreferencesConstants'

export const at = {
  CLEAR_EDITOR_STATE: 'CLEAR_EDITOR_STATE',
  SET_CURRENT_DOC: 'SET_CURRENT_DOC',
  CACHE_DOC: 'CACHE_DOC',
  MARK_DIRTY: 'MARK_DIRTY',
  MARK_CLEAN: 'MARK_CLEAN',
  DOC_ID_CHANGE: 'DOC_ID_CHANGE',
}

export const clearEditorState = () => async (dispatch) => {
  dispatch({type: at.CLEAR_EDITOR_STATE})
}

export const setCurrentDoc = (id) => async (dispatch) => {
  dispatch({type: at.SET_CURRENT_DOC, payload: {id}})
}

export const clearCurrentDoc = () => async (dispatch) => {
  dispatch({type: at.SET_CURRENT_DOC, payload: {id: null}})
}

export const cacheDoc = (id, code, decoRanges) => async (dispatch) => {
  dispatch({type: at.CACHE_DOC, payload: {id, code, decoRanges}})
}

export const docIdChange = (oldId, newId) => async (dispatch) => {
  dispatch({type: at.DOC_ID_CHANGE, payload: {oldId, newId}})
}

export const markClean = (id) => async (dispatch) => {
  dispatch({type: at.MARK_CLEAN, payload: {id}})
}

//TODO actually use change generation correctly
export const markDirty = (id) => async (dispatch, getState) => {
  const {dirtyList} = getState().editor

  // For performance, only dispatch if necessary
  if (!dirtyList[id]) {
    dispatch({type: at.MARK_DIRTY, payload: {id}})
  }
}

const updateCachedDoc = (id, code) => async (dispatch, getState) => {

  const {docCache, dirtyList} = getState().editor
  const decoDoc = docCache[id]

  // If the doc has unsaved changes, return
  if (dirtyList[id]) return

  // If the doc is not cached, return
  if (!decoDoc) return

  // If this file has any live values, return.
  // Live values prevent files from updating properly.
  // Live values are deprecated, so no need to fix this.
  if (decoDoc.decoRanges.length > 0) return

  // If data hasn't changed, return
  if (decoDoc.code === code) return

  // Update the doc
  decoDoc.code = code

  return Promise.all([
    dispatch(markClean(id)),
    dispatch(fileActions.markSaved(id)),
  ])
}

const loadMetadataAndCacheDoc = (id, code) => async (dispatch, getState) => {
  let metadata

  try {
    metadata = await dispatch(metadataActions.loadMetadata(id))
  } catch (e) {

    // If the metadata file doesn't exist
    if (e.code === 'ENOENT') {

      // Cache the doc assuming no live values
      return Promise.all([
        dispatch(cacheDoc(id, code, [])),
        dispatch(historyActions.createHistory(id)),
      ])

    } else {
      console.error(`Error reading metadata for ${id}`)
      return
    }
  }

  // Metadata loaded successfully
  const {decoRanges, liveValueIds, liveValuesById} = metadata.liveValues

  return Promise.all([
    dispatch(liveValueActions.setLiveValues(id, liveValueIds, liveValuesById)),
    dispatch(cacheDoc(id, code, decoRanges)),
    dispatch(historyActions.createHistory(id)),
  ])
}

export const loadDoc = (payload) => async (dispatch, getState) => {
  const {docCache} = getState().editor
  const {id, utf8Data: code} = payload

  if (docCache[id]) {
    return dispatch(updateCachedDoc(id, code))
  } else {
    return dispatch(loadMetadataAndCacheDoc(id, code))
  }
}

const getCachedDecoDoc = (docCache, id) => {
  const decoDoc = docCache[id]

  if (!decoDoc) {
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
      dispatch(applicationActions.saveLive())
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
  return liveValueActions.setLiveValueIds(fileId, liveValueIds)
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

      dispatch(historyActions.addToHistory(id, combinedChange))
    } else {
      dispatch(historyActions.addToHistory(id, decoChange))
    }

    // Update live values if there are any, or if any have changed
    if (initialCodeForRanges.length > 0 || rangesWithModifiedTokenTypes.length > 0) {
      dispatch(setLiveValuesForDoc(id, decoDoc))
    }

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

      dispatch(historyActions.undoFromHistory(id))
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

      dispatch(historyActions.redoToHistory(id))
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
      dispatch(applicationActions.saveLive())
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

    dispatch(liveValueActions.importLiveValues(decoDoc.id, liveValuesById))

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

  dispatch(liveValueActions.importLiveValues(decoDoc.id, liveValuesById))

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

      dispatch(liveValueActions.createLiveValue(id, decoRangeId, text, rangeName, cmToken.type))
    }

    decoDoc.edit(decoChange)
    dispatch(historyActions.addToHistory(id, decoChange))

    dispatch(setLiveValuesForDoc(id, decoDoc))
  }
}

function _getFileData(filePath) {
  return {
    type: GET_FILE_DATA,
    filePath,
  }
}
export function openDocument(filePath) {
  return (dispatch, getState) => {
    const state = getState()
    if (state.editor && state.editor.docCache && state.editor.docCache[filePath]) {
      dispatch(setCurrentDoc(filePath))
      return Promise.resolve()
    } else {
      return request(_getFileData(filePath)).then((payload) => {
        dispatch(loadDoc(payload))
        return dispatch(setCurrentDoc(filePath))
      })
    }
  }
}
