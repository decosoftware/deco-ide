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
 * A wrapper around CodeMirror positions
 */
class CodeMirrorRange {

  constructor(from, to) {
    this._from = from
    this._to = to
  }

  get from() {
    return this._from
  }

  get to() {
    return this._to
  }

  /*** SERIALIZATION ***/

  toJSON() {
    return {
      to: this.to,
      from: this.from,
    }
  }

  static fromJSON(json) {
    return new CodeMirrorRange(json.to, json.from)
  }

  clone() {
    return CodeMirrorRange.fromJSON(this.toJSON())
  }

}

export default CodeMirrorRange
