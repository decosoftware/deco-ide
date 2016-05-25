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

import {
  ON_COMPONENT_LIST,
  LOAD_COMPONENT_METADATA,
} from '../../actions/componentActions'

import ScaffoldFactory from '../../factories/scaffold/ScaffoldFactory'

const initialState = {
  coreList: ScaffoldFactory.items(),
  coreComponents: ScaffoldFactory.makeCoreComponents(),
  componentList: [],
  localComponents: {},
}

const componentReducer = (state = initialState, action) => {
  switch(action.type) {
    case ON_COMPONENT_LIST:
      return Object.assign({}, state, {
          componentList: action.list,
        })
    case LOAD_COMPONENT_METADATA:
      //skip module components, they already exist
      if (action.module) {
        return state
      }
      return Object.assign({}, state, {
        localComponents: Object.assign({},
          state.localComponents,
          {
            [action.name]: action.metadata
          }
        )
      })
    default:
      return state
  }
}

export default componentReducer
