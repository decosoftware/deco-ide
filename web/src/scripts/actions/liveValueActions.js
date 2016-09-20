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

import * as textEditorCompositeActions from './textEditorCompositeActions'
import LiveValueUtils from '../utils/metadata/LiveValueUtils'

export const CREATE_LIVE_VALUE = 'CREATE_LIVE_VALUE'
export const createLiveValue = (fileId, liveValueId, text, name, type) => {

  const metadata = LiveValueUtils.guessLiveValueMetadata(name, type, text)
  Object.assign(metadata, {
    type,
    name
  })

  return {
    type: CREATE_LIVE_VALUE,
    payload: {
      fileId,
      liveValueId,
      metadata,
    },
  }
}

export const IMPORT_LIVE_VALUES = 'IMPORT_LIVE_VALUES'
export const importLiveValues = (fileId, liveValuesById) => {
  return {
    type: IMPORT_LIVE_VALUES,
    payload: {
      fileId,
      liveValuesById,
    },
  }
}

export const SET_LIVE_VALUE_IDS = 'SET_LIVE_VALUE_IDS'
export const setLiveValueIds = (fileId, liveValueIds) => {
  return {
    type: SET_LIVE_VALUE_IDS,
    payload: {
      fileId,
      liveValueIds,
    },
  }
}

export const SET_LIVE_VALUES = 'SET_LIVE_VALUES'
export const setLiveValues = (fileId, liveValueIds, liveValuesById) => {
  return {
    type: SET_LIVE_VALUES,
    payload: {
      fileId,
      liveValueIds,
      liveValuesById,
    },
  }
}

export const SET_LIVE_VALUE_METADATA_FIELD = 'SET_LIVE_VALUE_METADATA_FIELD'
export const setLiveValueMetadataField = (fileId, liveValueId, fieldName, fieldValue) => {
  return {
    type: SET_LIVE_VALUE_METADATA_FIELD,
    payload: {
      fileId,
      liveValueId,
      fieldName,
      fieldValue,
    },
  }
}

export const SET_LIVE_VALUE_CODE = 'SET_LIVE_VALUE_CODE'
export const setLiveValueCode = (fileId, range, code) => {
  return (dispatch, getState) => {
    dispatch(textEditorCompositeActions.setTextForRange(fileId, code, range))
  }
}
