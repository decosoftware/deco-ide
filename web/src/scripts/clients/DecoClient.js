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

import * as URIUtils from '../utils/URIUtils'
import HTTPClient from './HTTPClient'
import PopupUtils from '../utils/PopupUtils'

const BASE = 'http://decowsstaging.herokuapp.com'
const http = new HTTPClient(BASE)

const defaultComponent = {
  "name": "Untitled",
  "publisher": "dabbott",
  "schemaVersion": "0.1.0",
  "tags": [],
  "thumbnail": "https://placehold.it/100/100",
  "description": "A React Native component",
  "packageName": "react-native-untitled",
  "tagName": "UntitledComponent",
  "props": [],
  "imports": [
    {
      name: 'react-native',
      members: [
        {name: 'default', alias: 'ReactNative'},
        {name: '*', alias: 'Everything'},
        {name: 'View'},
        {name: 'Image'},
      ],
    },
  ],
  "dependencies": [
    {
      name: 'left-pad',
      version: '*',
    },
  ],
}

export default class {

  /* COMPONENTS */

  static getComponents() {
    return http.get(`/components`)
  }

  static getUserComponents(userId, params) {
    return http.get(`/users/${userId}/components`, params)
  }

  static createComponent(component = defaultComponent, params) {
    return http.post(`/components`, params, component)
  }

  static modifyComponent(method, component, params) {
    const {id, revisionId} = component

    if (!id) {
      throw new Error(`Cannot ${method} component - missing id`)
    }

    if (!revisionId) {
      throw new Error(`Cannot ${method} component - missing revisionId`)
    }

    return http[method](`/components/${id}/${revisionId}`, params, component)
  }

  static updateComponent(component, params) {
    return this.modifyComponent('put', component, params)
  }

  static deleteComponent(component, params) {
    return this.modifyComponent('delete', component, params)
  }

  /* USERS */

  static getUser(id, params) {
    return http.get(`/users/${id}`, params)
  }

  /* AUTHENTICATION */

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
        const {access_token} = URIUtils.parseQueryString(location)
        return access_token
      }
    })
  }
}
