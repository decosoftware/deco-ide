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
  TOGGLE_VIEW: 'TOGGLE_VIEW',
}

export const toggleStoryboardView = () => async (dispatch) => {
  dispatch({
    type: at.TOGGLE_VIEW,
  })
}

const parseStoryboardCode = (storyboardCode, rootPath) => {
  const sceneImports = storyUtils.getFilePathsFromStoryboardCode(storyboardCode, {
    directoryPath: rootPath,
  })
  const sceneInfo = storyUtils.getSceneInformationForStoryboardCode(storyboardCode)
  return {sceneImports, sceneInfo}
}

const loadSceneImportFiles = (sceneImports, dispatch) => {
  return Promise.all(_.map(sceneImports,
    (sceneImport) => dispatch(editorActions.getDocument(sceneImport.source))
  ))
}

const buildSceneConnections = (sceneImports, sceneImportsDocsById, sceneInfo) => {
  return _.map(sceneImports, ({sceneName, source}) => {
    const {code} = sceneImportsDocsById[source]
    sceneInfo.scenes[sceneName].filePath = source
    storyUtils.buildElementTree(code)
    return {
      connections: storyUtils.getConnectionsInCode(code),
      sceneName,
    }
  })
}

export const openStoryboard = (filepath) => async (dispatch, getState) => {
  const rootPath = getState().directory.rootPath
  // Open and parse storyboard file
  const {code: storyboardCode} = await dispatch(editorActions.openDocument(filepath))
  const {sceneImports, sceneInfo} = parseStoryboardCode(storyboardCode, rootPath)

  // Load files from all scene imports into docs
  const sceneImportDocs = await loadSceneImportFiles(sceneImports, dispatch)
  const sceneImportsDocsById = _.keyBy(sceneImportDocs, 'id')

  // Build connections from scene files
  const sceneConnections = buildSceneConnections(
    sceneImports, sceneImportsDocsById, sceneInfo
  )

  // Need to match component info to sourceinfo.
  // Update state of redux app, so Storyboard receives updates
  dispatch({
    type: at.OPEN_STORYBOARD,
    payload: {
      connections: sceneConnections,
      scenes: sceneInfo.scenes,
      entry: sceneInfo.entry,
    },
  })
}

const createNewSceneScaffold = async (rootPath, dispatch) => {
  // Should decide how to name new scenes
  const newSceneName = `NewScene${Math.floor(Math.random()*1000)}`

  // Generate scene scaffold text and write the file
  const scaffold = FileScaffoldFactory.getScaffoldFromName('Scene')
  const fileName = `${newSceneName}${scaffold.extname}`
  const text = scaffold.generate({name: newSceneName})
  const filePath = path.join(rootPath, fileName)
  await dispatch(fileTreeCompositeActions.createFile(filePath, text))

  return {newSceneName, filePath}
}

export const addScene = () => async (dispatch, getState) => {
  const {rootPath} = getState().directory
  const {openDocId} = getState().editor

  // Scaffold new scene and write to file
  const {newSceneName, filePath} = await createNewSceneScaffold(rootPath, dispatch)

  // Update the .storyboard.js file with new lines:
  // import NewScene from 'NewScene'
  // SceneManager.registerScene("NewScene", NewScene)
  const decoDoc = await dispatch(editorActions.getDocument(openDocId))
  const decoChange = StoryboardChangeFactory.addSceneToStoryboard(decoDoc, newSceneName, `./${newSceneName}`)
  dispatch(textEditorCompositeActions.edit(decoDoc.id, decoChange))

  // Update redux state of app so Storyboard component picks up changes
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

  // Delete the file corresponding to the removed scene
  dispatch(fileTreeCompositeActions.deleteFile(filePath))

  // Remove scene references from .storyboard.js file:
  // import NewScene from 'NewScene'
  // SceneManager.registerScene("NewScene", NewScene)
  const decoDoc = await dispatch(editorActions.getDocument(openDocId))
  const decoChange = StoryboardChangeFactory.removeSceneFromStoryboard(decoDoc, name, `./${name}`)
  dispatch(textEditorCompositeActions.edit(decoDoc.id, decoChange))

  // Update redux state of app so Storyboard component picks up changes
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

export const updateEntryScene = (sceneId) => async (dispatch, getState) => {
  const {scenes} = getState().storyboard
  if (!scenes[sceneId])
    return

  const {openDocId} = getState().editor
  const {name} = scenes[sceneId]

  const decoDoc = await dispatch(editorActions.getDocument(openDocId))
  const decoChange = StoryboardChangeFactory.updateEntryScene(decoDoc, name)
  dispatch(textEditorCompositeActions.edit(decoDoc.id, decoChange))
}
