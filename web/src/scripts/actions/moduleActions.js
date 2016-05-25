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

import request from '../ipc/Request'
import {
  SCAN_PROJECT_FOR_REGISTRIES,
} from 'shared/constants/ipc/ModuleConstants'

export const ADD_MODULE_REGISTRY = 'ADD_MODULE_REGISTRY'
export const addModuleRegistry = (registry, modules) => {
  return {
    type: ADD_MODULE_REGISTRY,
    payload: {
      registry,
      modules,
    }
  }
}

const _scanLocalRegistries = (path) => {
  return {
    type: SCAN_PROJECT_FOR_REGISTRIES,
    path,
  }
}

export const scanLocalRegistries = (path) => (dispatch) => {
  return request(_scanLocalRegistries(path)).then(({payload}) => {
  	_.each(payload, (modules, registry) => {
  		dispatch(addModuleRegistry(registry, modules))
  	})
  })
}