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

import CodeMirror from 'codemirror'

import CodeMirrorRange from './CodeMirrorRange'
import Pos from './CodeMirrorPos'

class DecoRange extends CodeMirrorRange {

  constructor(id, from, to) {
    super(from, to)
    this._id = id
  }

  get id() {
    return this._id
  }

  /*** SERIALIZATION ***/

  toCMRange() {
    return new CodeMirrorRange(this.from, this.to)
  }

  toJSON() {
    return Object.assign(super.toJSON(), {
      id: this.id,
    })
  }

  static fromJSON(json) {
    return new DecoRange(json.id, json.from, json.to)
  }

  clone() {
    return DecoRange.fromJSON(this.toJSON())
  }

}

export default DecoRange
