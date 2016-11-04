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

import { batchActions } from 'redux-batched-subscribe'
import FileConstants from 'shared/constants/ipc/FileConstants'
const { GET_FILE_DATA } = FileConstants

import request from '../ipc/Request'
import * as fileActions from './fileActions'
import * as historyActions from './historyActions'
import * as liveValueActions from './liveValueActions'
import * as metadataActions from './metadataActions'

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

export const cacheDoc = (id, code, decoRanges = []) => async (dispatch) => {
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
      return dispatch(batchActions([
        cacheDoc(id, code),
        historyActions.createHistory(id),
      ]))

    } else {
      console.error(`Error reading metadata for ${id}`)
      return
    }
  }

  // Metadata loaded successfully
  const {decoRanges, liveValueIds, liveValuesById} = metadata.liveValues

  return dispatch(batchActions([
    liveValueActions.setLiveValues(id, liveValueIds, liveValuesById),
    cacheDoc(id, code, decoRanges),
    historyActions.createHistory(id),
  ]))
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

export const openDocument = (filePath) => async (dispatch, getState) => {
  const doc = await dispatch(getDocument(filePath))
  await dispatch(setCurrentDoc(filePath))
  return doc
}

export const getDocument = (filePath) => async (dispatch, getState) => {
  const {docCache} = getState().editor

  if (docCache[filePath]) {
    return docCache[filePath]
  }

  const payload = await request({type: GET_FILE_DATA, filePath})
  await dispatch(loadDoc(payload))

  return getState().editor.docCache[filePath]
}
