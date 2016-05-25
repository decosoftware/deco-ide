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

import DecoChange, {CHANGE_TYPE, } from './DecoChange'
import CodeMirrorChange from './CodeMirrorChange'

class DecoTextChange extends DecoChange {

  constructor(cmChange) {
    super()
    this._cmChange = cmChange
  }

  get type() {
    return CHANGE_TYPE.TEXT
  }

  get cmChange() {
    return this._cmChange
  }

  invert() {
    return new DecoTextChange(this._cmChange.invert())
  }

  /*** SERIALIZATION ***/

  toJSON() {
    return {
      type: this.type,
      cmChange: this.cmChange.toJSON(),
    }
  }

  static fromJSON(json) {
    const cmChange = CodeMirrorChange.fromJSON(json.cmChange)
    return new DecoTextChange(cmChange)
  }

  clone() {
    return DecoTextChange.fromJSON(this.toJSON())
  }

}

export default DecoTextChange
