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
import PrimitiveTypes from '../../constants/PrimitiveTypes'
import { EDIT_WITH, DROPDOWN_OPTIONS, } from '../../constants/LiveValueConstants'
import { parseColor } from '../CSSColorParser'
import { toValue } from '../Parser'
import uuid from '../uuid'
import DecoRange from '../../models/editor/DecoRange'
import Pos from '../../models/editor/CodeMirrorPos'

class LiveValueUtils {
  static guessLiveValueMetadata(name, type, text) {
    const metadata = {}

    if (type === PrimitiveTypes.STRING) {
      const value = toValue(text)
      const color = parseColor(value)

      if (color) {
        metadata.editWith = EDIT_WITH.COLOR_PICKER
      } else if (DROPDOWN_OPTIONS[name]) {
        metadata.editWith = EDIT_WITH.DROPDOWN
        metadata.dropdownOptions = name
      } else {
        metadata.editWith = EDIT_WITH.INPUT_FIELD
      }
    }

    return metadata
  }

  static denormalizeLiveValueMetadata(decoRanges, liveValuesById) {
    const liveValues = _.map(decoRanges, (decoRange) => {
      return Object.assign({
        range: {
          from: decoRange.from,
          to: decoRange.to,
        },
      }, liveValuesById[decoRange.id])
    })

    return liveValues
  }

  static denormalizeLiveValueMetadataFromDoc(liveValueMetadata, decoDoc) {
    const {liveValuesById} = liveValueMetadata
    const {decoRanges} = decoDoc.toJSON()
    return this.denormalizeLiveValueMetadata(decoRanges, liveValuesById)
  }

  static normalizeLiveValueMetadata(liveValues = []) {
    const liveValueIds = []
    const liveValuesById = {}
    const decoRanges = []

    _.each(liveValues, (liveValueJSON) => {
      const liveValueId = uuid()
      const {from, to} = liveValueJSON.range

      // Extract position info
      decoRanges.push(new DecoRange(
        liveValueId,
        new Pos(from.line, from.ch),
        new Pos(to.line, to.ch)
      ))

      const liveValueMetadata = _.cloneDeep(liveValueJSON)
      delete liveValueMetadata.range

      liveValueIds.push(liveValueId)
      liveValuesById[liveValueId] = liveValueMetadata
    })

    return {
      liveValueIds,
      liveValuesById,
      decoRanges,
    }
  }
}

export default LiveValueUtils
