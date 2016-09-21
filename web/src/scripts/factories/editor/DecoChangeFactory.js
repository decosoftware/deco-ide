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

import {CHANGE_TYPE, } from '../../models/editor/DecoChange'
import CodeMirrorChange from '../../models/editor/CodeMirrorChange'
import DecoTextChange from '../../models/editor/DecoTextChange'
import DecoRangeChange, {RANGE_CHANGE_TYPE} from '../../models/editor/DecoRangeChange'
import DecoCompositeChange from '../../models/editor/DecoCompositeChange'

const CONSTRUCTORS = {
  [CHANGE_TYPE.TEXT]: DecoTextChange,
  [CHANGE_TYPE.RANGE]: DecoRangeChange,
  [CHANGE_TYPE.COMPOSITE]: DecoCompositeChange,
}

class DecoChangeFactory {

  static createChangeFromRange(decoDoc, range, text, origin) {
    const originalText = decoDoc.getCodeForRange(range)
    const {from, to} = range

    return this.createChangeToSetText(from, to, text, originalText, origin)
  }

  static createChangeFromCMChange(cmChange) {
    return new DecoTextChange(cmChange)
  }

  static createChangeToAddDecoRange(decoRange) {
    return new DecoRangeChange(decoRange, RANGE_CHANGE_TYPE.ADD)
  }

  static createChangeToAddDecoRanges(decoRanges) {
    return this.createCompositeChange(_.map(decoRanges, (decoRange) => {
      return new DecoRangeChange(decoRange, RANGE_CHANGE_TYPE.ADD)
    }))
  }

  static createChangeToRemoveDecoRange(decoRange) {
    return new DecoRangeChange(decoRange, RANGE_CHANGE_TYPE.REMOVE)
  }

  static createChangeToRemoveDecoRanges(decoRanges) {
    const subChanges = _.map(decoRanges, (decoRange) => {
      return new DecoRangeChange(decoRange, RANGE_CHANGE_TYPE.REMOVE)
    })
    return new DecoCompositeChange(subChanges)
  }

  static createCompositeChange(decoChanges) {
    return new DecoCompositeChange(decoChanges)
  }

  static createChangeToSetText(from, to, text, originalText, origin) {
    const cmChange = new CodeMirrorChange(from, to, text, originalText, origin)
    return new DecoTextChange(cmChange, origin)
  }

  static createChangeFromJSON(json) {
    return CONSTRUCTORS[json.type].fromJSON(json)
  }

}

export default DecoChangeFactory
