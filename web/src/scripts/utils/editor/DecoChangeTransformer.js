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

import N from '../../utils/simpleCodeMirrorPosition'
import DecoChange, {CHANGE_TYPE, } from '../../models/editor/DecoChange'
import DecoRangeChange, {RANGE_CHANGE_TYPE, } from '../../models/editor/DecoRangeChange'
import DecoTextChange from '../../models/editor/DecoTextChange'
import DecoCompositeChange from '../../models/editor/DecoCompositeChange'
import CodeMirrorChange from '../../models/editor/CodeMirrorChange'
import DecoRange from '../../models/editor/DecoRange'
import Pos from '../../models/editor/CodeMirrorPos'

import _ from 'lodash'

class DecoChangeTransformer {

  /**
   * Find ranges where the change would overlap with their whitespace
   *
   * @param  {DecoChange} decoChange
   * @param  {DecoRange[]} decoRanges
   * @return {DecoRange[]}
   */
  static rangesWhereChangeOverlapsWhitespace(decoChange, decoRanges) {

    const ranges = []
    const {from: changeFrom, to: changeTo} = decoChange.cmChange

    _.each(decoRanges, (decoRange) => {
      const {from: rangeFrom, to: rangeTo} = decoRange
      const leadingWhiteSpace = N(rangeFrom)
      const trailingWhiteSpace = N(rangeTo) - 1

      // Check if text change would remove either trailing or leading whitespace
      if ((N(changeFrom) <= leadingWhiteSpace && leadingWhiteSpace < N(changeTo)) ||
          (N(changeFrom) <= trailingWhiteSpace && trailingWhiteSpace < N(changeTo))) {
        ranges.push(decoRange)
      }
    })

    return ranges
  }

  /**
   * Shift subsequent changes forward or backward based on spaces added or
   * removed in range changes.
   *
   * TODO: Counting per line isn't enough granularity - need to know where
   * on the line a range started and ended. Also assumes ranges are sorted
   * and not interrupted by text changes.
   *
   * @param  {DecoChanges[]} decoChanges
   * @return {DecoChanges[]}
   */
  static shiftSubsequentChanges(decoChanges) {
    const shiftedChanges = []
    const rangeCountPerLine = {}

    _.each(decoChanges, (decoChange) => {

      if (decoChange.type === CHANGE_TYPE.RANGE) {
        const {id, from, to} = decoChange.decoRange
        const rangeChangeType = decoChange.rangeChangeType

        // Offset positions by other whitespace added/removed
        const rangeCount = rangeCountPerLine[from.line] || 0

        shiftedChanges.push(new DecoRangeChange(
          new DecoRange(
            id,
            new Pos(from.line, from.ch + rangeCount * 2),
            new Pos(to.line, to.ch + rangeCount * 2)
          ),
          rangeChangeType
        ))

        if (rangeChangeType === RANGE_CHANGE_TYPE.ADD) {
          rangeCountPerLine[from.line] = rangeCount + 1
        } else {
          rangeCountPerLine[from.line] = rangeCount - 1
        }
      } else {
        shiftedChanges.push(decoChange)
      }
    })

    return shiftedChanges
  }

  /**
   * Transform a DecoTextChange by deleting any ranges that would have their
   * leading or tailing whitespace deleted.
   *
   * @param  {DecoChange} decoChange
   * @param  {DecoRange[]} decoRanges
   * @return {DecoChange}
   */
  static transformDecoTextChange(decoChange, decoRanges) {

    const rangesToDelete = this.rangesWhereChangeOverlapsWhitespace(decoChange, decoRanges)

    if (rangesToDelete.length > 0) {

      // Remove all ranges overlapped by whitespace
      const subChanges = _.map(rangesToDelete, (decoRange) => {
        return new DecoRangeChange(
          decoRange,
          RANGE_CHANGE_TYPE.REMOVE
        )
      })

      // Then perform the text change
      subChanges.push(decoChange)

      return new DecoCompositeChange(subChanges)
    } else {
      return decoChange
    }
  }

  /**
   * Transform a decoRange addition
   * 1. Add the leading whitespace
   * 2. Add the trailing whitespace
   * 3. Add the range
   *
   * @param  {DecoChange} decoChange
   * @return {DecoChange}
   */
  static transformAddDecoRangeChange(decoChange) {
    const {id, from, to} = decoChange.decoRange

    const subChanges = [
      new DecoTextChange(
        new CodeMirrorChange(
          from,
          from,
          [' '],
          ['']
        )
      ),
      new DecoTextChange(
        new CodeMirrorChange(
          new CodeMirror.Pos(to.line, to.ch + 1),
          new CodeMirror.Pos(to.line, to.ch + 1),
          [' '],
          ['']
        )
      ),
      new DecoRangeChange(
        new DecoRange(
          id,
          from,
          new CodeMirror.Pos(to.line, to.ch + 2)
        ),
        RANGE_CHANGE_TYPE.ADD
      )
    ]

    return new DecoCompositeChange(subChanges)
  }

  /**
   * Transform a decoRange removal
   * 1. Remove the range
   * 2. Delete the trailing whitespace
   * 3. Delete the leading whitespace
   *
   * @param  {DecoChange} decoChange
   * @return {DecoChange}
   */
  static transformRemoveDecoRangeChange(decoChange) {
    const {id, from, to} = decoChange.decoRange

    const subChanges = [
      new DecoRangeChange(
        decoChange.decoRange,
        RANGE_CHANGE_TYPE.REMOVE
      ),
      new DecoTextChange(
        new CodeMirrorChange(
          new CodeMirror.Pos(to.line, to.ch - 1),
          new CodeMirror.Pos(to.line, to.ch),
          [''],
          [' ']
        )
      ),
      new DecoTextChange(
        new CodeMirrorChange(
          from,
          new CodeMirror.Pos(from.line, from.ch + 1),
          [''],
          [' ']
        )
      ),
    ]

    return new DecoCompositeChange(subChanges)
  }

  /**
   * Transform a deco range change based on its `rangeChangeType` to either
   * add or remove whitespace
   *
   * @param  {DecoChange} decoChange
   * @return {DecoChange}
   */
  static transformDecoRangeChange(decoChange) {
    switch (decoChange.rangeChangeType) {
      case RANGE_CHANGE_TYPE.ADD:
        return this.transformAddDecoRangeChange(decoChange)
      break
      case RANGE_CHANGE_TYPE.REMOVE:
        return this.transformRemoveDecoRangeChange(decoChange)
      break
    }
  }

  /**
   * Transform a deco composite change by transforming each subchange
   *
   * @param  {DecoChange} decoChange
   * @param  {DecoRange[]} decoRanges
   * @return {DecoChange}
   */
  static transformDecoCompositeChange(decoChange, decoRanges) {
    const shiftedChanges = this.shiftSubsequentChanges(decoChange.subChanges)

    const subChanges = _.map(shiftedChanges, (subChange) => {
      return this.transformDecoChange(subChange, decoRanges)
    })

    return new DecoCompositeChange(subChanges)
  }

  /**
   * Transform a deco change
   *
   * We do this transformation because some changes must be made by Deco
   * rather than the user typing and CodeMirror handling them automatically.
   * Ranges must be deleted by Deco, not CodeMirror, since Deco manages
   * the history for these changes - the range would otherwise be unrecoverable.
   *
   * @param  {DecoChange} decoChange
   * @param  {DecoRange[]} decoRanges
   * @return {DecoChange}
   */
  static transformDecoChange(decoChange, decoRanges) {
    switch (decoChange.type) {
      case CHANGE_TYPE.TEXT:
        return this.transformDecoTextChange(decoChange, decoRanges)
      break
      case CHANGE_TYPE.RANGE:
        return this.transformDecoRangeChange(decoChange)
      break
      case CHANGE_TYPE.COMPOSITE:
        return this.transformDecoCompositeChange(decoChange, decoRanges)
      break
      default:
        return decoChange
      break
    }
  }

  /**
   * Flatten any DecoCompositeChanges, returning a list of DecoChanges with no
   * DecoCompositeChanges.
   *
   * @param  {DecoChange[]} decoChanges
   * @return {DecoChange[]}
   */
  static flattenChanges(decoChanges, accumulator = []) {
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

  /**
   * Flatten any DecoCompositeChanges, returning either a non-composite change,
   * or a DecoCompositeChange with no DecoCompositeChanges in its subChanges
   *
   * @param  {DecoChange} decoChange
   * @return {DecoChange}
   */
  static flattenChange(decoChange) {
    const subChanges = this.flattenChanges([decoChange])
    if (subChanges.length === 1) {
      return subChanges[0]
    }
    return new DecoCompositeChange(subChanges)
  }

}

export default DecoChangeTransformer
