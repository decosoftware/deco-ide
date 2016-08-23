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
import semver from 'semver'

import {
  ADD_MODULE_REGISTRY
} from '../actions/moduleActions'

const initialState = {
  modules: [],
}

const REGISTRY_KEY = '__REGISTRY'
const SCHEMA_VERSIONS_SUPPORTED = '0.0.1 || 0.0.2 || 0.0.3'

const moduleReducer = (state = initialState, action) => {
  switch(action.type) {
    case ADD_MODULE_REGISTRY:
      const {registry, modules} = action.payload

      let newModules = _.cloneDeep(modules)

      // Only allow modules with an appropriate version
      newModules = _.filter(newModules, (module) => {
        return semver.valid(module.schemaVersion) &&
            semver.satisfies(module.schemaVersion, SCHEMA_VERSIONS_SUPPORTED)
      })

      // If no new modules, bail out
      if (newModules.length === 0) {
        return state
      }

      // Add registry key into the module objects
      newModules = _.map(modules, (module) => {
        return Object.assign({}, module, {
          [REGISTRY_KEY]: registry,
        })
      })

      // Remove modules that came from the given registry
      const currentModules = _.reject(state.modules, [REGISTRY_KEY, registry])

      return {
        ...state,
        modules: _.sortBy([
          ...currentModules,
          ...newModules,
        ], 'name')
      }
    default:
      return state
    break
  }
}

export default moduleReducer
