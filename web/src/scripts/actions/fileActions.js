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

import request from '../ipc/Request'
import FileConstants from 'shared/constants/ipc/FileConstants'
import ProjectConstants from 'shared/constants/ipc/ProjectConstants'
const {
  CREATE_FILE,
  CREATE_DIRECTORY,
  RENAME,
  DELETE,
  FETCH_SUB_PATH,
  WATCH_PATH,
} = FileConstants
const {
  SHARE_SAVE_STATUS,
} = ProjectConstants

import ProcessConstants from 'shared/constants/ipc/ProcessConstants'
const {
  RUN_PACKAGER,
} = ProcessConstants

import {routeActions} from 'react-router-redux'

import _ from 'lodash'

const path = Electron.remote.require('path')
function getPathRoot(absolutePath) {
  return path.basename(absolutePath)
}

export const CLEAR_FILE_STATE = 'CLEAR_FILE_STATE'
export const clearFileState = () => {
  return {
    type: CLEAR_FILE_STATE,
  }
}

export const REMOVE_SUB_PATH = 'REMOVE_SUB_PATH'
export const removeSubPath = (payload) => {
  return {
    type: REMOVE_SUB_PATH,
    id: payload.id,
    fileInfo: {
      id: payload.id,
      absolutePath: payload.absolutePathArray,
    },
  }
}

export const REMOVE_SUB_PATH_BATCH = 'REMOVE_SUB_PATH_BATCH'
export const removeSubPathBatch = (payloads) => {
  return {
    type: REMOVE_SUB_PATH_BATCH,
    paths: _.map(payloads.batch, (payload) => {
      return {
        id: payload.id,
        fileInfo: {
          id: payload.id,
          absolutePath: payload.absolutePathArray,
        },
      }
    }),
  }
}

export const ADD_SUB_PATH = 'ADD_SUB_PATH'
export const addSubPath = (payload) => {
  const isLeaf = payload.fileType == 'dir'
  return {
    type: ADD_SUB_PATH,
    id: payload.id,
    fileInfo: {
      id: payload.id,
      module: payload.baseName,
      absolutePath: payload.absolutePathArray,
      fileType: payload.fileType,
      isLeaf: isLeaf,
    },
  }
}

export const BATCH_ADD_SUB_PATHS = 'BATCH_ADD_SUB_PATH'
export const batchAddSubPaths = (payloads) => {
  return {
    type: BATCH_ADD_SUB_PATHS,
    paths: _.map(payloads.batch, (payload) => {
      const isLeaf = payload.fileType == 'dir'
      return {
        id: payload.id,
        fileInfo: {
          id: payload.id,
          module: payload.baseName,
          absolutePath: payload.absolutePathArray,
          fileType: payload.fileType,
          isLeaf: isLeaf,
        },
      }
    }),
  }
}

export const SET_TOP_DIR = 'SET_TOP_DIR'
export const _setTopDir = (rootPath) => {
  return {
    type: SET_TOP_DIR,
    rootPath: rootPath,
    rootName: getPathRoot(rootPath),
  }
}

function _watchPath(rootPath) {
  return {
    type: WATCH_PATH,
    rootPath,
  }
}
export function setTopDir(rootPath) {
  return (dispatch) => {
    const setProject = () => {
      dispatch(_setTopDir(rootPath))
      dispatch(fetchSubPath({
        absolutePath: rootPath
      }))
    }

    request(_watchPath(rootPath)).then(() => {
      setProject()
    }).catch(() => {
      request(_watchPath(rootPath)).then(() => {
        setProject()
      })
    })
  }
}

export const SET_COLLAPSE_ON_NODE = 'SET_COLLAPSE_ON_NODE'
export const setCollapseOnNode = (node, collapsed) => {
  return {
    type: SET_COLLAPSE_ON_NODE,
    id: node.id,
    collapsed: collapsed,
  }
}

export const SELECT_FILE = 'SELECT_FILE'
export const selectFile = (id) => {
  return {
    type: SELECT_FILE,
    id,
  }
}

export const CLEAR_SELECTIONS = 'CLEAR_SELECTIONS'
export const clearSelections = () => {
  return {
    type: CLEAR_SELECTIONS,
  }
}

function _updateSaveStatus(id, status) {
  return {
    type: SHARE_SAVE_STATUS,
    id,
    status,
  }
}

export const MARK_UNSAVED = 'MARK_UNSAVED'
export const markUnsaved = (id) => {
  return (dispatch) => {
    dispatch({
      type: MARK_UNSAVED,
      id: id,
    })
    request(_updateSaveStatus(id, true))
  }
}

export const MARK_SAVED = 'MARK_SAVED'
export const markSaved = (id) => {
  return (dispatch) => {
    dispatch({
      type: MARK_SAVED,
      id: id,
    })
    request(_updateSaveStatus(id, false))
  }
}

export const FILE_ID_CHANGE = 'FILE_ID_CHANGE'
export const fileIdChange = (oldId, newId) => {
  return {
    type: FILE_ID_CHANGE,
    oldId,
    newId,
  }
}

export const REPLACE_NODE = 'REPLACE_NODE'
export const replaceNode = (oldNode, node) => {
  return {
    type: REPLACE_NODE,
    node,
    oldNode,
  }
}

function _createFile(id, filename, data) {
  return {
    type: CREATE_FILE,
    id,
    filename,
    data,
  }
}
export function createFile(fileInfo, filename, data) {
  return (dispatch) => {
    return request(_createFile(fileInfo.id, filename, data))
  }
}

function _createDirectory(id, dirname) {
  return {
    type: CREATE_DIRECTORY,
    id,
    dirname,
  }
}
export function createDirectory(fileInfo, dirname) {
  return (dispatch) => {
    request(_createDirectory(fileInfo.id, dirname))
  }
}

function _rename(id, newName) {
  return {
    type: RENAME,
    id,
    newName,
  }
}
export function rename(fileInfo, newName) {
  return (dispatch) => {
    return request(_rename(fileInfo.id, newName))
  }
}

function _delete(id, fileType) {
  return {
    type: DELETE,
    id,
    fileType,
  }
}
export function deleteNode(fileInfo) {
  return (dispatch) => {
    request(_delete(fileInfo.id, fileInfo.fileType))
  }
}

function _fetchSubPath(path) {
  return {
    type: FETCH_SUB_PATH,
    path,
  }
}

// How many paths to add at a time in a subdirectory?
// For perf of opening massive directories
const BATCH_CHUNK_SIZE = 100
const BATCH_CHUNK_DELAY = 250

// thunk to handle async send, response to Application
export function fetchSubPath(fileInfo) {
  return (dispatch) => {
    request(_fetchSubPath(fileInfo.absolutePath)).then((resp) => {
      const {batch, type} = resp

      const handleNextChunk = (rest) => {
        const chunk = rest.slice(0, BATCH_CHUNK_SIZE)
        dispatch(batchAddSubPaths({type, batch: chunk}))
        if (rest.length > BATCH_CHUNK_SIZE) {
          setTimeout(() => {
            handleNextChunk(rest.slice(BATCH_CHUNK_SIZE))
          }, BATCH_CHUNK_DELAY)
        }
      }

      handleNextChunk(batch)
    })
  }
}
