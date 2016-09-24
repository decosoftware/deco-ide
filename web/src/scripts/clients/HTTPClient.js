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

export default class {
  constructor(baseUrl) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }

  createUrlParams(params) {
    return Object.keys(params).map(key => {
      return `${key}=${encodeURIComponent(params[key])}`
    }).join('&')
  }

  createUrl(endpoint, params) {
    const {baseUrl} = this
    return `${baseUrl}${endpoint}` + (params ? `?${this.createUrlParams(params)}` : '')
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

  static parseQueryString(url) {
    const params = {}
    const query = url.split('?')[1]

    if (!query) {
      return params
    }

    const components = query.split("&")

    components.forEach(component => {
      const pair = component.split("=")
      const key = decodeURIComponent(pair[0])
      const value = decodeURIComponent(pair[1])

      // Param may exist - there are potentially multiple with the same name
      const existing = params[key]

      if (typeof existing === 'undefined') {
        params[key] = value
      } else if (typeof existing === 'string') {
        params[key] = [existing, value]
      } else {
        params[key].push(value)
      }
    })

    return params
  }
}
