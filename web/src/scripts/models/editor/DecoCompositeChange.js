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
import DecoChangeTransformer from '../../utils/editor/DecoChangeTransformer'

class DecoCompositeChange extends DecoChange {

  constructor(subChanges) {
    super()
    this._subChanges = DecoChangeTransformer.flattenChanges(subChanges)
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

}

export default DecoCompositeChange
