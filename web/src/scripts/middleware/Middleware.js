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

/**
 * Middleware to interact with DecoDocs and CodeMirror events
 */
class Middleware {

  setDispatchFunction(dispatch) {
    this._dispatch = dispatch
  }

  get dispatch() {
    if (! this._dispatch) {
      throw new Error('Middleware not property initialized with dispatch function')
    }
    return this._dispatch
  }

  get eventListeners() {
    return {}
  }

  attach(/* decoDoc */) {
    throw new Error('Attach not implemented by subclass')
  }

  detach() {
    throw new Error('Detach not implemented by subclass')
  }

}

export default Middleware
