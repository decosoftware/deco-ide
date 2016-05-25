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

import request from '../ipc/Request'

import ComponentConstants from 'shared/constants/ipc/ComponentConstants'
const {
  IMPORT_COMPONENT,
  GET_COMPONENT_LIST,
} = ComponentConstants

export const ON_COMPONENT_LIST = 'ON_COMPONENT_LIST'
export const _onComponentList = (list) => {
  return {
    type: ON_COMPONENT_LIST,
    list: list,
  }
}

export const LOAD_COMPONENT_METADATA = 'LOAD_COMPONENT_METADATA'
export const loadComponent = (componentInfo, metadata) => {
  return {
    type: LOAD_COMPONENT_METADATA,
    name: componentInfo.name,
    module: componentInfo.module,
    metadata,
  }
}

function _importComponent(projectRoot, componentName) {
  return {
    type: IMPORT_COMPONENT,
    projectRoot,
    componentName,
  }
}
export function importComponent(componentInfo) {
  return (dispatch, getState) => {
    const state = getState()
    ga('send', {
      hitType: 'event',
      eventCategory: 'Component',
      eventAction: 'insert',
      eventValue: componentInfo.name,
    })
    if (state.metadata.components.localComponents[componentInfo.name]) {
      return Promise.resolve()
    }
    if (componentInfo.module) {
      return Promise.resolve()
    }
    return request(_importComponent(state.directory.rootPath, componentInfo.name))
  }
}

function _getComponentList() {
  return {
    type: GET_COMPONENT_LIST,
  }
}
export function getComponentList() {
  return (dispatch, getState) => {
    request(_getComponentList()).then((resp) => {
      dispatch(_onComponentList(resp.componentList))
    })
  }
}
