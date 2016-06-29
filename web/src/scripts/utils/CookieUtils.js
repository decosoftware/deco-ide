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

const session = Electron.remote.session

export default class {
  static get(url) {
    const {cookies} = session.defaultSession

    return new Promise((resolve, reject) => {
      cookies.get({url}, (err, items) => {
        if (err) {
          reject(err)
        } else {
          resolve(items)
        }
      })
    })
  }

  static removeItem(url, name) {
    const {cookies} = session.defaultSession

    return new Promise((resolve, reject) => {
      cookies.remove(url, name, (err) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    })
  }

  static async remove(url) {
    const {cookies} = session.defaultSession

    const items = await this.get(url)
    const deletions = items.map(item => this.removeItem(url, item.name))

    return Promise.all(deletions)
  }
}
