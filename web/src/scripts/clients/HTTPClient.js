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

import * as URIUtils from '../utils/URIUtils'

export default class {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }

  createUrlParams(params) {
    return URIUtils.createUrlParams(params)
  }

  createUrl(endpoint, params) {
    const {baseUrl} = this
    return URIUtils.createUrl(`${baseUrl}${endpoint}`, params)
  }

  get(endpoint, params) {
    return fetch(this.createUrl(endpoint, params))
    .then(response => response.json())
  }

  post(endpoint, params, body) {
    return fetch(this.createUrl(endpoint, params), {
      method: 'POST',
      headers: this.defaultHeaders,
      body: JSON.stringify(body),
    })
    .then(response => response.json())
  }

  put(endpoint, params, body) {
    return fetch(this.createUrl(endpoint, params), {
      method: 'PUT',
      headers: this.defaultHeaders,
      body: JSON.stringify(body),
    })
  }

  delete(endpoint, params) {
    return fetch(this.createUrl(endpoint, params), {
      method: 'DELETE',
      headers: this.defaultHeaders,
    })
  }
}
