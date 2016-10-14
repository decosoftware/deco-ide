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

const getImportedScenes = (storyboardCode, rootPath) => {
  return storyUtils
    .getFilePathsFromStoryboardCode(storyboardCode)
    .map(({name, source}) => ({
      id: name, // Used?
      name,
      filePath: path.join(rootPath, source),
    }))
}

const getEntryName = (storyboardCode) => {
  return storyUtils.getSceneInformationForStoryboardCode(storyboardCode).entry
}

const parseStoryboardCode = (storyboardCode, rootPath) => {
  const entry = getEntryName(storyboardCode)
  const scenes = getImportedScenes(storyboardCode, rootPath)

  return {entry, scenes}
}

const loadSceneDocuments = (scenes, dispatch) => {
  const loadScene = scene => dispatch(editorActions.getDocument(scene.filePath))

  return Promise.all(scenes.map(loadScene))
}

const buildSceneConnections = (sceneDecoDocs) => {
  return _.chain(sceneDecoDocs)
    .map(({code, id}) => storyUtils.getConnectionsInCode(code))
    .flatten()
    .value()
}

export const openStoryboard = (filepath) => async (dispatch, getState) => {
  const rootPath = getState().directory.rootPath

  // Open and parse storyboard file
  const {code: storyboardCode} = await dispatch(editorActions.getDocument(filepath))
  const {entry, scenes} = parseStoryboardCode(storyboardCode, rootPath)

  // Open imported scenes and parse their connections
  const sceneDecoDocs = await loadSceneDocuments(scenes, dispatch)
  const connections = buildSceneConnections(sceneDecoDocs)

  dispatch({
    type: at.OPEN_STORYBOARD,
    payload: {entry, scenes, connections},
  })
}

const createNewSceneScaffold = (rootPath) => {
  // Should decide how to name new scenes
  const newSceneName = `NewScene${Math.floor(Math.random()*1000)}`

  // Generate scene scaffold text and write the file
  const scaffold = FileScaffoldFactory.getScaffoldFromName('Scene')
  const fileName = `${newSceneName}${scaffold.extname}`
  const text = scaffold.generate({name: newSceneName})
  const filePath = path.join(rootPath, fileName)

  return {name: newSceneName, filePath, text}
}

export const addScene = (storyboardPath) => async (dispatch, getState) => {
  const {
    directory: {rootPath},
  } = getState()

  // Scaffold new scene and write to file
  const {name, filePath, text} = createNewSceneScaffold(rootPath)
  await dispatch(fileTreeCompositeActions.createFile(filePath, text))

  // Update the .storyboard.js file with new lines:
  // - import NewScene from 'NewScene'
  // - SceneManager.registerScene("NewScene", NewScene)
  const decoDoc = await dispatch(editorActions.getDocument(storyboardPath))
  const decoChange = StoryboardChangeFactory.addSceneToStoryboard(decoDoc, name, `./${name}`)
  dispatch(textEditorCompositeActions.edit(decoDoc.id, decoChange))

  dispatch({
    type: at.ADD_SCENE,
    payload: {id: name, name, filePath}
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

export const addConnection = () => async (dispatch) => {
  dispatch({type: at.ADD_CONNECTION})
}

export const updateConnection = () => async (dispatch) => {
  dispatch({type: at.UPDATE_CONNECTION})
}

export const deleteConnection = () => async (dispatch) => {
  dispatch({type: at.DELETE_CONNECTION})
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
