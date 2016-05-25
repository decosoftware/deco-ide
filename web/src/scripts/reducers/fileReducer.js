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
import {
  CLEAR_FILE_STATE,
  SET_TOP_DIR,
  ADD_SUB_PATH,
  BATCH_ADD_SUB_PATHS,
  REMOVE_SUB_PATH,
  REMOVE_SUB_PATH_BATCH,
  SELECT_FILE,
  CLEAR_SELECTIONS,
  MARK_UNSAVED,
  MARK_SAVED,
  REPLACE_NODE,
  FILE_ID_CHANGE,
  SET_COLLAPSE_ON_NODE,
} from '../actions/fileActions'

import {
  addNode,
  removeNode,
  updateSubTree,
  updateSelected,
  updateSaveStatus,
  updateCollapsed,
} from '../utils/treeDiff.js'

const initialState = {
  paths: {},
  tree: {},
  selected: {},
  filesById: {},
}

const fileReducer = (state = initialState, action) => {
  switch(action.type) {
    case CLEAR_FILE_STATE:
      return Object.assign({}, initialState)
    case SET_TOP_DIR:
      return Object.assign({}, state, {
          rootPath: action.rootPath,
          rootName: action.rootName,
        })
    case ADD_SUB_PATH:
      const addTree = addNode(
        Object.assign({}, state.tree),
        state.rootName,
        action.fileInfo
      )
      return Object.assign({}, state, {
        tree: addTree, //tree diff only updates single paths
        filesById: Object.assign({}, state.filesById, {
          [action.fileInfo.id]: action.fileInfo,
        })
      })
    case BATCH_ADD_SUB_PATHS:
    {
      const filesById = _.chain(action.paths)
        .map('fileInfo')
        .keyBy('id')
        .value()
      let batchTree = Object.assign({}, state.tree)
      _.each(action.paths, (pathInfo) => {
        batchTree = addNode(
          batchTree,
          state.rootName,
          pathInfo.fileInfo
        )
      })
      return Object.assign({}, state, {
        tree: batchTree,
        filesById: Object.assign({}, state.filesById, filesById)
      })
    }
    case REMOVE_SUB_PATH:
    {
      const removeTree = removeNode(
        Object.assign({}, state.tree),
        state.rootName,
        action.fileInfo
      )
      const filesById = Object.assign({}, state.filesById)
      delete filesById[action.fileInfo.id]
      return Object.assign({}, state, {
        tree: removeTree,
        filesById,
      })
    }
    case REMOVE_SUB_PATH_BATCH:
    {
      let batchRemoveTree = Object.assign({}, state.tree)
      const filesById = Object.assign({}, state.filesById)
      _.each(action.paths, (pathInfo) => {
        batchRemoveTree = removeNode(
          batchRemoveTree,
          state.rootName,
          pathInfo.fileInfo
        )
        delete filesById[pathInfo.fileInfo.id]
      })
      return {
        ...state,
        tree: batchRemoveTree,
        filesById,
      }
    }
    case SELECT_FILE:
      const newSelection = Object.assign({}, state.selected, {
        [action.id]: true,
      })
      const updatedTree = updateSelected(
        Object.assign({}, state.tree),
        newSelection
      )
      return Object.assign({}, state, {
        selected: newSelection,
        tree: updatedTree,
      })
    case CLEAR_SELECTIONS:
      return Object.assign({}, state, {
        selected: {},
      })
    case SET_COLLAPSE_ON_NODE:
      const newCollapseTree = updateCollapsed(
        Object.assign({}, state.tree),
        action.id,
        action.collapsed
      )
      return Object.assign({}, state, {
        tree: newCollapseTree,
      })
    case FILE_ID_CHANGE:
      const changedUnsaved = state.unsaved
      const changedSelection = state.selected
      _.each(_.keys(changedUnsaved), (key) => {
        if (key.includes(action.oldId)) {
          const newSubId = key.replace(action.oldId, action.newId)
          if (_.has(changedUnsaved, newSubId)) {
            changedUnsaved[newSubId] = changedUnsaved[key]
            delete changedUnsaved[key]
          }
        }
      })
      _.each(_.keys(changedSelection), (key) => {
        if (key.includes(action.oldId)) {
          const newSubId = key.replace(action.oldId, action.newId)
          if (_.has(changedSelection, newSubId)) {
            changedSelection[newSubId] = changedSelection[key]
            delete changedSelection[key]
          }
        }
      })
      return Object.assign({}, state, {
        unsaved: changedUnsaved,
        selected: changedSelection,
      })
    case REPLACE_NODE:
      const insertTree = updateSubTree(
        Object.assign({}, state.tree),
        state.rootName,
        action.node,
        action.oldNode,
      )
      return Object.assign({}, state, {
        tree: insertTree,
      })
    case MARK_SAVED:
      const savedTree = updateSaveStatus(
        Object.assign({}, state.tree),
        action.id,
        false
      )
      const newUnsaved = Object.assign({}, state.unsaved)
      delete newUnsaved[action.id]
      return Object.assign({}, state, {
        tree: savedTree,
        unsaved: newUnsaved,
      })
    case MARK_UNSAVED:
      const unsavedTree = updateSaveStatus(
        Object.assign({}, state.tree),
        action.id,
        true
      )
      return Object.assign({}, state, {
        tree: unsavedTree,
        unsaved: Object.assign({}, state.unsaved, {
          [action.id]: true
        }),
      })
    default:
      return state
  }
}

export default fileReducer
