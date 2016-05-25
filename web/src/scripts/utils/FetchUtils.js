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

const fs = Electron.remote.require('fs')

export default {
  isLocal(url) {
    return ! url.startsWith('http')
  },
  fetchLocal(url) {
    try {
      const text = fs.readFileSync(url, 'utf8')
      return Promise.resolve({
        text: () => text,
        json: () => JSON.parse(text),
      })
    } catch (e) {
      return Promise.reject(e)
    }
  },
  fetchResource(url) {
    if (this.isLocal(url)) {
      return this.fetchLocal(url)
    } else {
      return fetch(url)
    }
  },
}
