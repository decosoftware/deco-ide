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
import path from 'path'

import * as editorActions from '../actions/editorActions'
import * as storyUtils from '../utils/storyboard'
import StoryboardChangeFactory from '../factories/storyboard/StoryboardChangeFactory'
import FileScaffoldFactory from '../factories/scaffold/FileScaffoldFactory'
import { fileTreeCompositeActions, textEditorCompositeActions } from '../actions'

export const at = {
  ADD_SCENE: 'ADD_SCENE',
  DELETE_SCENE: 'DELETE_SCENE',
  RENAME_SCENE: 'RENAME_SCENE',
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
    await dispatch(editorActions.getDocument(filepath))
  }))

  //get scenes from storyboard code
  const docCache = getState().editor.docCache

  let scenes = {...sceneInfo.scenes}
  //get code from new files
  //get connections for files
  const sceneConnections = _.map(sceneImports, ({ sceneName, source }) => {
    scenes[sceneName].filePath = source
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
    payload: {
      connections: sceneConnections,
      scenes: scenes,
      entry: sceneInfo.entry,
    },
  })
}

export const addScene = () => async (dispatch, getState) => {
  const scaffoldId = 0 // Component
  const {rootPath} = getState().directory
  const {openDocId} = getState().editor
  const newSceneName = `newScene${Math.floor(Math.random()*1000)}`

  const filename = FileScaffoldFactory.updateFilename(scaffoldId, newSceneName)
  const text = FileScaffoldFactory.generateScaffold(scaffoldId, {filename})
  const filePath = path.join(rootPath, filename)
  await dispatch(fileTreeCompositeActions.createFile(filePath, text))

  const decoDoc = await dispatch(editorActions.getDocument(openDocId))
  const decoChange = StoryboardChangeFactory.addSceneToStoryboard(decoDoc, newSceneName, `./${filename}`)
  dispatch(textEditorCompositeActions.edit(decoDoc.id, decoChange))
  dispatch({
    type: at.ADD_SCENE,
    payload: {
      [newSceneName]: {
        id: newSceneName,
        name: newSceneName,
        filePath: filePath,
      }
    }
  })
}

export const deleteScene = (sceneId) => async (dispatch, getState) => {
  const {scenes} = getState().storyboard
  if (!scenes[sceneId] || !scenes[sceneId].filePath) {
    return
  }
  const {filePath, id, name} = scenes[sceneId]
  const {openDocId} = getState().editor
  dispatch(fileTreeCompositeActions.deleteFile(filePath))
  const decoDoc = await dispatch(editorActions.getDocument(openDocId))
  const decoChange = StoryboardChangeFactory.removeSceneFromStoryboard(decoDoc, name, `./${name}`)
  dispatch(textEditorCompositeActions.edit(decoDoc.id, decoChange))
  dispatch({
    type: at.DELETE_SCENE,
    payload: id
  })
}

export const renameScene = (sceneId, newName) => async (dispatch) => {
  const {scenes} = getState().storyboard
  if (!scenes[sceneId] || !scenes[sceneId].filePath) {
    return
  }
  const {filePath} = scenes[sceneId]
  const ext = path.extname(filePath)
  dispatch(fileTreeCompositeActions.renameFile(filePath, path.join(rootPath, `${newName}${ext}`)))
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
