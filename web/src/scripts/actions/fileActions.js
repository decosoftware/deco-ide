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
import { fileTreeController } from '../filetree'

import FileConstants from 'shared/constants/ipc/FileConstants'
import ProjectConstants from 'shared/constants/ipc/ProjectConstants'
const {
  WATCH_PATH,
  SHOW_IN_FINDER,
} = FileConstants
const {
  SHARE_SAVE_STATUS,
} = ProjectConstants

const path = Electron.remote.require('path')
function getPathRoot(absolutePath) {
  return path.basename(absolutePath)
}

export const SET_TOP_DIR = 'SET_TOP_DIR'
export const _setTopDir = (rootPath) => {
  return {
    type: SET_TOP_DIR,
    payload: {
      rootPath: rootPath,
      rootName: getPathRoot(rootPath),
    }
  }
}

export const CLEAR_FILE_STATE = 'CLEAR_FILE_STATE'
export const clearFileState = () => {
  return { type: CLEAR_FILE_STATE }
}

export function setTopDir(rootPath) {
  return (dispatch) => {
    dispatch(_setTopDir(rootPath))
    const reset = true
    fileTreeController.setRootPath(rootPath, reset)
  }
}

const _registerPath = (filePath, info) => {
  return {
    type: REGISTER_PATH,
    payload: {
      [filePath]: info
    }
  }
}
export const REGISTER_PATH = 'REGISTER_PATH'
export const registerPath = (filePath) => {
  return (dispatch, getState) => {
    const _attemptRegister = (attempts) => {
      if (attempts > 3) {
        return
      }
      const info = {
        ...fileTreeController.tree.get(filePath),
      }
      if (Object.keys(info).length == 0) {
        setTimeout(() => {
          _attemptRegister(attempts + 1)
        }, 500)
      } else {
        dispatch(_registerPath(filePath, info))
      }
    }
    _attemptRegister(0)
  }
}

export const REMOVE_REGISTERED_PATH = 'REMOVE_REGISTERED_PATH'
export const removeRegisteredPath = (filePath) => {
  return {
    type: REMOVE_REGISTERED_PATH,
    filePath,
  }
}

export const UPDATE_FILE_TREE_VERSION = 'UPDATE_FILE_TREE_VERSION'
export const updateFileTreeVersion = (version) => {
  return {
    type: UPDATE_FILE_TREE_VERSION,
    payload: {
      version,
    }
  }
}


function _updateSaveStatus(id, status) {
  return {
    type: SHARE_SAVE_STATUS,
    id,
    status,
  }
}

const _getFileById = (state, id) => {
  return state.directory.filesById[id]
}

const _flipDirty = (state, id, dirty) => {
  return {
    ..._getFileById(state, id),
    dirty,
  }
}

export const MARK_UNSAVED = 'MARK_UNSAVED'
export const markUnsaved = (id) => async (dispatch, getState) => {
  if (!getState().directory.unsaved[id]) {
    dispatch({type: MARK_UNSAVED, payload: {id}})
    request(_updateSaveStatus(id, true))
  }
}

export const MARK_SAVED = 'MARK_SAVED'
export const markSaved = (id) => {
  return (dispatch, getState) => {
    dispatch({
      type: MARK_SAVED,
      id,
    })
    request(_updateSaveStatus(id, false))
  }
}

function _showInFinder(filePath) {
  return {
    type: SHOW_IN_FINDER,
    filePath,
  }
}

export function showInFinder(filePath) {
  return (dispatch) => {
    request(_showInFinder(filePath))
  }
}
