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

import HTTPClient from './HTTPClient'
import PopupUtils from '../utils/PopupUtils'

const BASE = 'http://decowsstaging.herokuapp.com'
const http = new HTTPClient(BASE)

const defaultComponent = {
  "name": "Untitled",
  "publisher": "dabbott",
  "schemaVersion": "0.0.3",
  "tags": [],
  "thumbnail": "https://placehold.it/100/100",
  "description": "A React Native component",
  "packageName": "react-native-untitled",
  "tagName": "UntitledComponent",
  "props": [],
  "imports": {
    "react-native": [
      "View"
    ],
  },
  "dependencies": {
    "react-native": "*"
  },
}

const localToRemote = (local) => {
  const remote = _.cloneDeep(local)
  delete remote.id
  return remote
}

const remoteToLocal = (remote) => {
  return {
    ...remote.payload,
    id: remote._id,
    componentId: remote.componentId
  }
}

export default class {
  static async getComponents() {
    const components = await http.get('/components')
    return components
      .filter(c => c.componentId && c.payload)
      .map(remoteToLocal)
  }

  static async createComponent(component = defaultComponent, params) {
    const created = await http.post('/components', params, localToRemote(component))
    return remoteToLocal(created)
  }

  static updateComponent(component, params) {
    const {id} = component

    if (!id) {
      throw new Error('Cannot update component - missing id')
    }

    return http.put(`/components/${id}`, params, localToRemote(component))
  }

  static deleteComponent(component, params) {
    const {id} = component

    if (!id) {
      throw new Error('Cannot update component - missing id')
    }

    return http.delete(`/components/${id}`, params)
  }

  static me(params) {
    return http.get('/users/me', params)
  }

  static authenticate() {
    const url = http.createUrl('/credentials')

    return PopupUtils.open(url, {
      width: 1060,
      height: 620,
      titleBarStyle: 'default',
      resizable: true,
      scrollbars: true,
    }, (location) => {
      const match = location.match(/users\/me/)

      if (match) {
        const {access_token} = HTTPClient.parseQueryString(location)
        return access_token
      }
    })
  }
}
