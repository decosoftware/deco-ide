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
  GET_FILE_METADATA,
  WRITE_FILE_METADATA,
  DELETE_FILE_METADATA,
} = FileConstants

import LiveValueUtils from '../utils/metadata/LiveValueUtils'

function _writeFileMetadata(filePath, rootPath, metadata) {
  return {
    type: WRITE_FILE_METADATA,
    filePath,
    rootPath,
    metadata,
  }
}

const _deleteFileMetadata = (filePath, rootPath) => {
  return {
    type: DELETE_FILE_METADATA,
    filePath,
    rootPath,
  }
}

export const saveMetadata = (fileId) => {
  return (dispatch, getState) => {
    const state = getState()
    const rootPath = state.directory.rootPath
    const metadata = state.metadata
    const decoDoc = state.editor.docCache[fileId]

    const output = {}
    const liveValues = LiveValueUtils.denormalizeLiveValueMetadataFromDoc(metadata.liveValues, decoDoc)

    if (! _.isEmpty(liveValues)) {
      output.liveValues = liveValues
    }

    // If no metadata, delete the metadata file
    if (_.isEmpty(output)) {
      request(_deleteFileMetadata(fileId, rootPath))
    // Else, write the metadata
    } else {
      request(_writeFileMetadata(fileId, rootPath, JSON.stringify(output, null, '\t')))
    }
  }
}

function _getFileMetadata(filePath, rootPath) {
  return {
    type: GET_FILE_METADATA,
    filePath,
    rootPath,
  }
}
export const loadMetadata = (fileId) => {
  return (dispatch, getState) => {
    const rootPath = getState().directory.rootPath
    return request(_getFileMetadata(fileId, rootPath)).then((payload) => {    
      const json = JSON.parse(payload.utf8Data)
      const output = {
        liveValues: LiveValueUtils.normalizeLiveValueMetadata(json.liveValues)
      }

      return output
    })
  }
}
