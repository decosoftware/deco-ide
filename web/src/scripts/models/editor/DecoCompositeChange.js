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

import DecoChange, {CHANGE_TYPE, } from './DecoChange'
import DecoChangeFactory from '../../factories/editor/DecoChangeFactory'

class DecoCompositeChange extends DecoChange {

  constructor(subChanges) {
    super()
    this._subChanges = this.flattenChanges(subChanges)
  }

  get type() {
    return CHANGE_TYPE.COMPOSITE
  }

  get subChanges() {
    return this._subChanges
  }

  invert() {
    const invertedChanges = _.invokeMap(this._subChanges, 'invert')
    return new DecoCompositeChange(invertedChanges.reverse())
  }

  /*** SERIALIZATION ***/

  toJSON() {
    return {
      type: this.type,
      subChanges: _.invokeMap(this.subChanges, 'toJSON'),
    }
  }

  static fromJSON(json) {
    const subChanges = _.map(json.subChanges, DecoChangeFactory.createChangeFromJSON)
    return new DecoCompositeChange(subChanges)
  }

  clone() {
    return DecoCompositeChange.fromJSON(this.toJSON())
  }

  /**
   * Flatten any DecoCompositeChanges, returning a list of DecoChanges with no
   * DecoCompositeChanges.
   *
   * @param  {DecoChange[]} decoChanges
   * @return {DecoChange[]}
   */
  flattenChanges(decoChanges, accumulator = []) {
    _.each(decoChanges, (decoChange) => {
      if (decoChange.type === CHANGE_TYPE.COMPOSITE) {
        const subChanges = this.flattenChanges(decoChange.subChanges)
        accumulator.push.apply(accumulator, subChanges)
      } else {
        accumulator.push(decoChange)
      }
    })

    return accumulator
  }

}

export default DecoCompositeChange
