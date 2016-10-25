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
import { storyboardActions, storyboardStore } from 'yops'

import * as editorActions from '../actions/editorActions'
import * as storyUtils from '../utils/storyboard'
import StoryboardChangeFactory from '../factories/storyboard/StoryboardChangeFactory'
import FileScaffoldFactory from '../factories/scaffold/FileScaffoldFactory'
import { fileTreeCompositeActions, textEditorCompositeActions } from '../actions'

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

  storyboardActions.setScenes(_.keyBy(scenes, 'id'))
  storyboardActions.setConnections(connections)
  storyboardActions.setActiveScene(entry)
}

const createNewSceneScaffold = (rootPath) => {

  // Choose a scene name at random
  const newSceneName = `NewScene${Math.floor(Math.random()*1000)}`

  // Generate scene scaffold text
  const scaffold = FileScaffoldFactory.getScaffoldFromName('Scene')
  const fileName = `${newSceneName}${scaffold.extname}`
  const text = scaffold.generate({name: newSceneName})
  const filePath = path.join(rootPath, fileName)

  return {id: newSceneName, name: newSceneName, filePath, text}
}

export const createScene = (storyboardPath) => async (dispatch, getState) => {
  const {directory: {rootPath}} = getState()

  // Scaffold new scene and write to file
  const {id, name, filePath, text} = createNewSceneScaffold(rootPath)
  await dispatch(fileTreeCompositeActions.createFile(filePath, text))

  // Update the .storyboard.js file with new lines:
  // - import NewScene from 'NewScene'
  // - SceneManager.registerScene("NewScene", NewScene)
  const decoDoc = await dispatch(editorActions.getDocument(storyboardPath))
  const decoChange = StoryboardChangeFactory.addSceneToStoryboard(decoDoc, name, `./${name}`)
  dispatch(textEditorCompositeActions.edit(decoDoc.id, decoChange))

  storyboardActions.addScene({id, name, filePath})
  storyboardActions.centerSceneInViewport(id)
}

export const deleteScene = (storyboardPath, sceneId) => async (dispatch, getState) => {

  // Delete the file corresponding to the removed scene
  const {scenes: oldScenes} = storyboardStore.getStoryboardState()
  const filePath = _.get(_.filter(oldScenes, (scene) => scene.id == sceneId), '[0].filePath')
  if (!filePath) return
  const {shouldDelete} = await dispatch(fileTreeCompositeActions.deleteFile(filePath))
  if (!shouldDelete) return //don't do anything

  const {id, name} = await storyboardActions.deleteScene(sceneId)

  // Remove scene references from .storyboard.js file:
  // - import NewScene from 'NewScene'
  // - SceneManager.registerScene("NewScene", NewScene)
  const decoDoc = await dispatch(editorActions.getDocument(storyboardPath))
  const decoChange = StoryboardChangeFactory.removeSceneFromStoryboard(decoDoc, name, `./${name}`)
  dispatch(textEditorCompositeActions.edit(decoDoc.id, decoChange))

  // Get scenes remaining after the deletion
  const {scenes, activeScene} = storyboardStore.getStoryboardState()

  // If we removed the entry scene, and there are scenes remaining
  if (sceneId === activeScene && scenes.length > 0) {

    // Choose the first scene, arbitrarily, as the new entry scene
    dispatch(updateEntryScene(storyboardPath, scenes[0].id))
  }
}

//TODO what about renaming files for other storyboards?
export const updateSceneName = (storyboardPath, oldName, newName) => async (dispatch, getState) => {
  // first check if this is necessary
  const {directory: {rootPath}} = getState()
  const decoDoc = await dispatch(editorActions.getDocument(storyboardPath))
  const {scenes: oldScenes} = parseStoryboardCode(decoDoc.code, rootPath)
  if (!_.find(oldScenes, (scene) => scene.name == oldName)) {
    return //the file renamed wasn't in this storyboard
  }

  // similar to openStoryboard, we'll make a decoChange then reparse the storyboard file
  // update the deco doc
  const decoChange = StoryboardChangeFactory.renameSceneInStoryboard(decoDoc, oldName, `./${oldName}`, newName, `./${newName}`)
  await dispatch(textEditorCompositeActions.edit(decoDoc.id, decoChange))

  dispatch(openStoryboard(storyboardPath))
}

const setEntryScene = (storyboardPath, sceneId, operation) => async (dispatch, getState) => {
  const decoDoc = await dispatch(editorActions.getDocument(storyboardPath))

  const decoChange = operation === 'add' ?
    StoryboardChangeFactory.addEntryScene(decoDoc, sceneId) :
    StoryboardChangeFactory.updateEntryScene(decoDoc, sceneId)

  dispatch(textEditorCompositeActions.edit(decoDoc.id, decoChange))

  storyboardActions.setActiveScene(sceneId)
}

export const addEntryScene = (storyboardPath, sceneId) => async (dispatch) => {
  dispatch(setEntryScene(storyboardPath, sceneId, 'add'))
}

export const updateEntryScene = (storyboardPath, sceneId) => async (dispatch) => {
  dispatch(setEntryScene(storyboardPath, sceneId, 'update'))
}
