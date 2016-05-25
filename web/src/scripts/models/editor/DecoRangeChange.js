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
import DecoRange from './DecoRange'
import Enum from '../../utils/Enum'

const RANGE_CHANGE_TYPE = Enum(
  'ADD',
  'REMOVE'
)

const RANGE_CHANGE_TYPE_INVERSE = {
  [RANGE_CHANGE_TYPE.ADD]: RANGE_CHANGE_TYPE.REMOVE,
  [RANGE_CHANGE_TYPE.REMOVE]: RANGE_CHANGE_TYPE.ADD,
}

class DecoRangeChange extends DecoChange {

  constructor(decoRange, rangeChangeType) {
    super()
    this._decoRange = decoRange
    this._rangeChangeType = rangeChangeType
  }

  get type() {
    return CHANGE_TYPE.RANGE
  }

  get rangeChangeType() {
    return this._rangeChangeType
  }

  get decoRange() {
    return this._decoRange
  }

  invert() {
    return new DecoRangeChange(
      this._decoRange,
      RANGE_CHANGE_TYPE_INVERSE[this._rangeChangeType]
    )
  }

  /*** SERIALIZATION ***/

  toJSON() {
    return {
      type: this.type,
      decoRange: this.decoRange.toJSON(),
      rangeChangeType: this.rangeChangeType,
    }
  }

  static fromJSON(json) {
    const decoRange = DecoRange.fromJSON(json.decoRange)
    return new DecoRangeChange(decoRange, json.rangeChangeType)
  }

  clone() {
    return DecoRangeChange.fromJSON(this.toJSON())
  }

}

DecoRangeChange.RANGE_CHANGE_TYPE = RANGE_CHANGE_TYPE

export default DecoRangeChange
