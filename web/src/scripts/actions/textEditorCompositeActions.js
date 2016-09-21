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
import semver from 'semver'

import request from '../ipc/Request'
import DecoChangeFactory from '../factories/editor/DecoChangeFactory'
import DecoRange from '../models/editor/DecoRange'
import DecoRangeUtils from '../utils/editor/DecoRangeUtils'
import DecoComponentUtils from '../utils/editor/DecoComponentUtils'
import LiveValueUtils from '../utils/metadata/LiveValueUtils'
import LiveValueGroupUtils from '../utils/metadata/LiveValueGroupUtils'
import uuid from '../utils/uuid'
import * as historyActions from './historyActions'
import * as liveValueActions from './liveValueActions'
import * as applicationActions from './applicationActions'
import { CATEGORIES, PREFERENCES } from 'shared/constants/PreferencesConstants'

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

const setLiveValuesForDoc = (fileId, decoDoc) => {
  const liveValueIds = _.map(decoDoc.decoRanges, 'id')
  return liveValueActions.setLiveValueIds(fileId, liveValueIds)
}

export const edit = (id, decoChange) => (dispatch, getState) => {
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

export const undo = (id) => (dispatch, getState) => {
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

export const redo = (id) => (dispatch, getState) => {
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

const insertImports = (decoDoc, imports, schemaVersion) => async (dispatch) => {

  // Add each import separately, as each import will change the line numbers of
  // subsequent imports. History events are merged based on timestamp, so they
  // will still become one event.
  if (
    semver.valid(schemaVersion) &&
    semver.satisfies(schemaVersion, '0.1.0')
  ) {
    imports = imports.map(({name, members}) => {
      const defaultMember = members.find(x => x.name === 'default')
      const regularMembers = members.filter(x => x.name !== '*' && x.name !== 'default')

      // This only handles the older cases of:
      // - default import
      // - multiple member imports
      // TODO Use jscodeshift to handle all cases
      if (defaultMember) {
        const change = DecoComponentUtils.createChangeToInsertImport(decoDoc, name, defaultMember.alias)
        dispatch(edit(decoDoc.id, change))
      } else if (regularMembers.length > 0) {
        const memberNames = regularMembers.map(member => member.name)
        const change = DecoComponentUtils.createChangeToInsertImport(decoDoc, name, memberNames)
        dispatch(edit(decoDoc.id, change))
      }
    })
  // schemaVersion <= 0.0.3
  } else {
    _.each(imports, (importValue, importKey) => {
      const change = DecoComponentUtils.createChangeToInsertImport(decoDoc, importKey, importValue)
      dispatch(edit(decoDoc.id, change))
    })
  }
}

export const insertTemplate = (decoDoc, text, metadata = {}, imports, groupName, schemaVersion) => async (dispatch, getState) => {

  let liveValues = metadata.liveValues || []

  if (groupName) {
    liveValues = LiveValueGroupUtils.setLiveValueGroupsFromImportName(
      liveValues,
      groupName,
      getState().metadata.liveValues,
      decoDoc.id
    )
  }

  const {decoRanges, liveValuesById} = LiveValueUtils.normalizeLiveValueMetadata(liveValues)

  if (decoRanges.length > 0) {
    dispatch(liveValueActions.importLiveValues(decoDoc.id, liveValuesById))
  }

  const insertChange = DecoComponentUtils.createChangeToInsertTemplate(
    decoDoc,
    text,
    decoRanges
  )

  dispatch(edit(decoDoc.id, insertChange))
  dispatch(insertImports(decoDoc, imports, schemaVersion))
}
