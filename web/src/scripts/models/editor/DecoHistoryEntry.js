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

import DecoChangeFactory from '../../factories/editor/DecoChangeFactory'

class DecoHistoryEntry {

  constructor(decoChange, timestamp = new Date()) {
    this._decoChange = decoChange
    this._timestamp = timestamp
  }

  get decoChange() {
    return this._decoChange
  }

  get timestamp() {
    return this._timestamp
  }

  shouldMergeWith(otherHistoryEntry) {
    return Math.abs(this.timestamp - otherHistoryEntry.timestamp) < 200
  }

  mergeWith(otherHistoryEntry) {
    return new DecoHistoryEntry(
      DecoChangeFactory.createCompositeChange([
        this.decoChange.clone(),
        otherHistoryEntry.decoChange.clone(),
      ]),
      otherHistoryEntry.timestamp
    )
  }

  /*** SERIALIZATION ***/

  toJSON() {
    return {
      decoChange: this._decoChange.toJSON(),
      timestamp: +this._timestamp,
    }
  }

  static fromJSON(json) {
    return new DecoHistoryEntry(
      DecoChangeFactory.createChangeFromJSON(json.decoChange),
      new Date(json.timestamp)
    )
  }

  clone() {
    return DecoHistoryEntry.fromJSON(this.toJSON())
  }

}

export default DecoHistoryEntry
