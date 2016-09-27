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

import { routeReducer, } from 'react-router-redux'
import { combineReducers, } from 'redux'
import fileReducer from './fileReducer'
import applicationReducer from './applicationReducer'
import editorReducer from './editorReducer'
import historyReducer from './historyReducer'
import metadataReducer from './metadata/metadataReducer'
import uiReducer from './uiReducer'
import preferencesReducer from './preferencesReducer'
import storyboard from './storyboardReducer'
import modules from './moduleReducer'
import components from './componentReducer'
import user from './userReducer'
import ast from './astReducer'
import elementTree from './elementTreeReducer'

const rootReducer = combineReducers({
  directory: fileReducer,
  application: applicationReducer,
  editor: editorReducer,
  routing: routeReducer,
  ui: uiReducer,
  metadata: metadataReducer,
  history: historyReducer,
  preferences: preferencesReducer,
  modules,
  components,
  user,
  ast,
  elementTree,
  storyboard,
})

export default rootReducer
