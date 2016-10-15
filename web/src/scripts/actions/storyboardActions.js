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
import { storyboardActions } from 'yops'

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
    .map(({code}) => storyUtils.getConnectionsInCode(code))
    .flatten()
    .value()
}

export const openStoryboard = (storyboardPath) => async (dispatch, getState) => {
  const {directory: {rootPath}} = getState()

  // Open and parse storyboard file
  const {code: storyboardCode} = await dispatch(editorActions.getDocument(storyboardPath))
  const {entry, scenes} = parseStoryboardCode(storyboardCode, rootPath)

  // Open imported scenes and parse their connections
  const sceneDecoDocs = await loadSceneDocuments(scenes, dispatch)
  const connections = buildSceneConnections(sceneDecoDocs)

  dispatch({
    type: at.OPEN_STORYBOARD,
    payload: {entry, scenes, connections},
  })

  storyboardActions.setScenes(_.keyBy(scenes, 'id'))
  storyboardActions.setConnections(connections)
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

export const createScene = (storyboardPath) => async (dispatch, getState) => {
  const {directory: {rootPath}} = getState()

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

  storyboardActions.addScene({id: name, name, filePath})
}

export const deleteScene = (storyboardPath, sceneId) => async (dispatch, getState) => {
  const {storyboard: {entry, scenes}} = getState()

  const {id, name, filePath} = scenes.find(x => x.id === sceneId)

  // Delete the file corresponding to the removed scene
  dispatch(fileTreeCompositeActions.deleteFile(filePath))

  // Remove scene references from .storyboard.js file:
  // - import NewScene from 'NewScene'
  // - SceneManager.registerScene("NewScene", NewScene)
  const decoDoc = await dispatch(editorActions.getDocument(storyboardPath))
  const decoChange = StoryboardChangeFactory.removeSceneFromStoryboard(decoDoc, name, `./${name}`)
  dispatch(textEditorCompositeActions.edit(decoDoc.id, decoChange))

  await dispatch({type: at.DELETE_SCENE, payload: id})

  storyboardActions.deleteScene(id)

  // Get scenes remaining after the deletion
  const remainingScenes = getState().storyboard.scenes

  // If we removed the entry scene, and there are scenes remaining
  if (entry === sceneId && remainingScenes.length > 0) {

    // Choose the first scene, arbitrarily, as the new entry scene
    dispatch(updateEntryScene(storyboardPath, remainingScenes[0].id))
  }
}

export const renameScene = (storyboardPath, sceneId, newName) => async (dispatch) => {
  const scenes = getState().storyboard.scenes
  const scene = scenes.find(x => x.id === sceneId)

  // Swap scene names in the file path
  const {filePath, name} = scene
  const nameIndex = filePath.lastIndexOf(name)
  const newFilePath = filePath.slice(0, nameIndex) + newName + filePath.slice(nameIndex + name.length)

  dispatch(fileTreeCompositeActions.renameFile(filePath, newFilePath))
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

const setEntryScene = (storyboardPath, sceneId, operation) => async (dispatch, getState) => {
  const scenes = getState().storyboard.scenes
  const scene = scenes.find(x => x.id === sceneId)

  if (!scene) return

  const {id, name} = scene
  const decoDoc = await dispatch(editorActions.getDocument(storyboardPath))

  const decoChange = operation === 'add' ?
    StoryboardChangeFactory.addEntryScene(decoDoc, name) :
    StoryboardChangeFactory.updateEntryScene(decoDoc, name)

  dispatch(textEditorCompositeActions.edit(decoDoc.id, decoChange))

  // Update entry scene in redux store
  dispatch({type: at.SET_ENTRY_SCENE, payload: scene.id})
}

export const addEntryScene = (storyboardPath, sceneId) => async (dispatch) => {
  dispatch(setEntryScene(storyboardPath, sceneId, 'add'))
}

export const updateEntryScene = (storyboardPath, sceneId) => async (dispatch) => {
  dispatch(setEntryScene(storyboardPath, sceneId, 'update'))
}
