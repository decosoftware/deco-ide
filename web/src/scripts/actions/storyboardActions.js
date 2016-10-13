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
import { fileTreeCompositeActions, textEditorCompositeActions, ElementTreeActions } from '../actions'

export const at = {
  ADD_SCENE: 'ADD_SCENE',
  DELETE_SCENE: 'DELETE_SCENE',
  RENAME_SCENE: 'RENAME_SCENE',
  SET_CONNECTIONS: 'SET_CONNECTIONS',
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
  const {entry, scenes} = getState().storyboard
  const scene = scenes[sceneId]
  if (!scene || !scene.filePath) {
    return
  }
  const {filePath, id, name} = scene
  const {openDocId} = getState().editor

  // Delete the file corresponding to the removed scene
  dispatch(fileTreeCompositeActions.deleteFile(filePath))

  // Remove scene references from .storyboard.js file:
  // import NewScene from 'NewScene'
  // SceneManager.registerScene("NewScene", NewScene)
  const decoDoc = await dispatch(editorActions.getDocument(openDocId))
  const removalDecoChange = StoryboardChangeFactory.removeSceneFromStoryboard(decoDoc, name, `./${name}`)
  dispatch(textEditorCompositeActions.edit(decoDoc.id, removalDecoChange))

  // Update redux state of app so Storyboard component picks up changes
  await dispatch({
    type: at.DELETE_SCENE,
    payload: id
  })

  // If the removed scene was previously the entry scene, try to set another
  // scene to be entry
  if (entry === sceneId) {
    // We'll have to figure out generally what to do if a user puts the
    // storyboard into a state like this (no scenes)
    if (Object.keys(getState().storyboard.scenes).length === 0) return

    // Get a random remaining scene and replace the entry scene with it
    const newEntryScene = _.map(scenes, 'name')[0]
    const entryDecoChange = StoryboardChangeFactory.updateEntryScene(decoDoc, newEntryScene)
    dispatch(textEditorCompositeActions.edit(decoDoc.id, entryDecoChange))
  }
}

export const renameScene = (sceneId, newName) => async (dispatch) => {
  const scene = getState().storyboard.scenes[sceneId]
  if (!scene || !scene.filePath) {
    return
  }
  const {filePath} = scene
  const ext = path.extname(filePath)
  dispatch(fileTreeCompositeActions.renameFile(filePath, path.join(rootPath, `${newName}${ext}`)))
}

const getLineFromElementId = (elementId) => {
  return elementId.line
}

const getPathFromElementId = (elementId) => {
  elementDotSplit = elementId.split('.')
  return elementDotSplit.slice(1, elementDotSplit.length - 1).join('')
}

const getFilenameFromElementId = (elementId) => {
  return elementId.fileName
}

connections: {
  [connectionid]: {
    id:
    component_id:
    to:,
    from:,
  }

}

const setConnections = async (elementId, connections, storyboardFunc, actionType, dispatch, getState) => {
  // CodeMod file to add Navigator.push("toScene")
  // storyUtils.getConnectionsInCode from the scene matching the file we codemod'd
  //
  const {elementTreeForFile} = getState().elementTree
  console.log("elementId", elementId)
  const element = ElementTreeUtils.getElementByPath(getPathFromElementId(elementId))
  const {scenes} = getState().storyboard
  // let connections = {}

  // some expensive shit in here. figure out smart element tree and file writing
  _.forEach(connections, async (conn) => {
    const scene = scenes[conn.from]
    if (!scene || !scene.filePath) return
    const line = getLineFromElementId(elementId)
    const fileName = getFilenameFromElementId(elementId)

    // update file w/ push("toScene")
    // onPress = () => NavigatorActions.push(toScene)
    const decoDoc = await dispatch(editorActions.getDocument(scene.filePath))
    const decoChange = storyboardFunc(decoDoc, line, conn.to)
    dispatch(textEditorCompositeActions.edit(decoDoc.id, decoChange))

    const newElementTree = storyUtils.buildElementTree(decoDoc.code)
    ElementTreeActions.setElementTree(fileName, newElementTree)

    // elementId root.0.1.0.kjkjk23j42k3lasdf

    // capture connection to send to redux
    _.set(connections, `${conn.from}.${elementId}.to`, conn.to)
  })

  console.log("new connections", connections)
  dispatch({
    type: actionType,
    payload: connections,
  })
}

export const addConnections = (elementId, connections) => async (dispatch, getState) => {
  setConnections(
    elementId,
    connections,
    StoryboardChangeFactory.addConnection,
    at.SET_CONNECTIONS,
    dispatch,
    getState
  );
}

export const updateConnections = (elementId, connections) => async (dispatch, getState) => {
  setConnections(
    elementId,
    connections,
    StoryboardChangeFactory.updateConnection,
    at.SET_CONNECTIONS,
    dispatch,
    getState
  );
}

export const deleteConnections = (elementId, connections) => async (dispatch, getState) => {
  setConnections(
    elementId,
    connections,
    StoryboardChangeFactory.updateConnection,
    at.DELETE_CONNECTIONS,
    dispatch,
    getState
  );
}

const setEntryScene = async (sceneId, dispatch, getState, decoChangeFunc) => {
  const scene = getState().storyboard.scenes[sceneId]
  if (!scene) return

  // Add or update entry scene in storyboard file
  const {openDocId} = getState().editor
  const decoDoc = await dispatch(editorActions.getDocument(openDocId))
  const decoChange = decoChangeFunc(decoDoc, scene.name)
  dispatch(textEditorCompositeActions.edit(decoDoc.id, decoChange))

  // Update entry scene in redux store
  dispatch({
    type: at.SET_ENTRY_SCENE,
    payload: scene.id,
  })
}

export const addEntryScene = (sceneId) => async (dispatch, getState) => {
  setEntryScene(sceneId, dispatch, getState, StoryboardChangeFactory.addEntryScene)
}

export const updateEntryScene = (sceneId) => async (dispatch, getState) => {
  setEntryScene(sceneId, dispatch, getState, StoryboardChangeFactory.updateEntryScene)
}
