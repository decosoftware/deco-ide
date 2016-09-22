/**
 *    Copyright (C) 2015 Deco Software Inat.
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

import * as editorActions from '../actions/editorActions'
import * as storyUtils from '../utils/storyboard'

export const at = {
  ADD_SCENE: 'ADD_SCENE',
  DELETE_SCENE: 'DELETE_SCENE',
  ADD_CONNECTION: 'ADD_CONNECTION',
  UPDATE_CONNECTION: 'UPDATE_CONNECTION',
  DELETE_CONNECTION: 'DELETE_CONNECTION',
  SET_ENTRY_SCENE: 'SET_ENTRY_SCENE',
  OPEN_STORYBOARD: 'OPEN_STORYBOARD',
}

export const openStoryboard = (filepath) => async (dispatch, getState) => {
  const storyboardDoc = getState().editor.docCache[filepath]
  const rootPath = getState().directory.rootPath
  const storyboardCode = storyboardDoc.code
  const sceneImports = storyUtils.getFilePathsFromStoryboardCode(storyboardCode, {
    directoryPath: rootPath,
  })
  const sceneInfo = storyUtils.getSceneInformationForStoryboardCode(storyboardCode)

  //load in files from imports
  await Promise.all(_.map(sceneImports, async (sceneImport, filepath) => {
    //strip the ./
    await dispatch(editorActions.openDocument(filepath, { loadOnly:true }))
  }))

  //get scenes from storyboard code
  const docCache = getState().editor.docCache

  //get code from new files
  //get connections for files
  const sceneConnections = _.map(sceneImports, ({ sceneName, source }) => {
    storyUtils.buildElementTree(docCache[source].code)
    return {
      connections: storyUtils.getConnectionsInCode(docCache[source].code),
      sceneName,
    }
  })

  // match source info to component layout info
  // return storyboard object
  dispatch({
    type: at.OPEN_STORYBOARD,
    connections: sceneConnections,
    ...sceneInfo, // { scenes, entry }
  })
}

export const addScene = () => async (dispatch) => {
  dispatch({type: at.ADD_SCENE})
}

export const deleteScene = () => async (dispatch) => {
  dispatch({type: at.DELETE_SCENE})
}

export const addConnection = () => async (dispatch) => {
  dispatch({type: at.ADD_CONNECTION})
}

export const updateConnection = () => async (dispatch) => {
  dispatch({type: at.UPDATE_CONNECTION})
}

export const deleteConnection = () => async (dispatch) => {
  dispatch({type: at.DELETE_CONNECTION})
}

export const setEntryScene = () => async (dispatch) => {
  dispatch({type: at.SET_ENTRY_SCENE})
}
