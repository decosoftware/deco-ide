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

import Pos from '../../models/editor/CodeMirrorPos'
import DecoRange from '../../models/editor/DecoRange'
import { getType, guessValueName, } from '../Parser'
import PrimitiveTypes, {DISPLAY_NAMES, } from '../../constants/PrimitiveTypes'
import N from '../simpleCodeMirrorPosition'

const DECO_RANGE_SORTBY = ['from.line', 'from.ch']

const SHIFT_DIRECTION = _.mapKeys([
  'TOWARD_START',
  'TOWARD_END',
])

class DecoRangeUtils {

  /**
   * Guess the name of a DecoRange based on precending text and its type
   *
   * @param  {DecoDoc} decoDoc
   * @param  {DecoRange} decoRange
   * @return {String}
   */
  static guessDecoRangeName(decoDoc, decoRange) {

    // Get text from start of doc to this range
    const text = decoDoc.cmDoc.getRange(Pos.MIN, decoRange.from)

    // Try to guess the name based on preceding text
    let name = guessValueName(text)

    // If that fails, use the type
    if (! name) {
      name = getType(decoDoc.cmDoc.getRange(decoRange.from, decoRange.to))
    }

    // If all else fails, default
    if (! name) {
      name = 'Value'
    }

    return _.upperFirst(name)
  }

  static shiftDecoRanges(decoRanges, textStartPos, shiftDirection) {
    let dir = 1
    if (shiftDirection === SHIFT_DIRECTION.TOWARD_END) {
      dir = -1
    }

    return _.map(decoRanges, (decoRange) => {
      const {from, to, id} = decoRange

      // Offset line number
      let fromLine = from.line - (dir * textStartPos.line)
      let toLine = to.line - (dir * textStartPos.line)

      let fromCh, toCh

      // If on the same line, offset character position
      if ((shiftDirection === SHIFT_DIRECTION.TOWARD_START && from.line === textStartPos.line) ||
          (shiftDirection === SHIFT_DIRECTION.TOWARD_END && from.line === 0)) {
        fromCh = from.ch - (dir * textStartPos.ch)
        toCh = to.ch - (dir * textStartPos.ch)

      // Else, character position stays the same
      } else {
        fromCh = from.ch
        toCh = to.ch
      }

      return new DecoRange(id, new Pos(fromLine, fromCh), new Pos(toLine, toCh))
    })
  }

  /**
   * Find DecoRanges where the type of the primitive value has changed.
   *
   * @param  {{id, code}[]} initialCodeForRanges Code for the ranges, before edit
   * @param  {DecoRange[]}  updatedRanges        Ranges after edit
   * @param  {{id, code}[]} updatedCodeForRanges Code for each range, after edit
   * @return {DecoRange[]}                       Ranges where the code type has changed
   */
  static findRangesWithModifiedTokenTypes(initialCodeForRanges, updatedRanges, updatedCodeForRanges) {
    const tokenTypesById = {}

    _.each(initialCodeForRanges, ({id, code}) => {
      tokenTypesById[id] = getType(code)
    })

    const decoRangesById = _.keyBy(updatedRanges, 'id')
    const rangesWithModifiedTokenTypes = []

    _.each(updatedCodeForRanges, ({id, code}) => {
      if (tokenTypesById[id] && tokenTypesById[id] !== getType(code)) {
        rangesWithModifiedTokenTypes.push(decoRangesById[id])
      }
    })

    return rangesWithModifiedTokenTypes
  }

  /**
   * Given a list of decoRanges, add them to the current cmDoc, expanding
   * them to include leading and trailing whitespace. Assumes the cmDoc has no
   * ranges in it.
   *
   * @param  {DecoDoc} decoDoc
   * @param  {DecoRange[]} decoRanges
   */
  static expandDecoRanges(decoDoc, decoRanges) {
    if (decoRanges.length === 0) {
      return
    }

    // Ensure ranges are sorted, or positions will be off
    const sortedRanges = _.sortBy(decoRanges, DECO_RANGE_SORTBY)
    const rangeCountPerLine = {}

    _.each(sortedRanges, (decoRange) => {

      // Offset positions by other whitespace added
      const rangeCount = rangeCountPerLine[decoRange.from.line] || 0
      rangeCountPerLine[decoRange.from.line] = rangeCount + 1

      const offsetRange = new DecoRange(
        decoRange.id,
        new Pos(decoRange.from.line, decoRange.from.ch + rangeCount * 2),
        new Pos(decoRange.to.line, decoRange.to.ch + rangeCount * 2),
      )

      // Add whitespace (in reverse order, so positions don't change)
      decoDoc.cmDoc.replaceRange(' ', offsetRange.to)
      decoDoc.cmDoc.replaceRange(' ', offsetRange.from)

      // Expand the range to include whitespace
      const expandedRange = new DecoRange(
        decoRange.id,
        new Pos(decoRange.from.line, decoRange.from.ch + rangeCount * 2),
        new Pos(decoRange.to.line, decoRange.to.ch + 2 + rangeCount * 2),
      )

      // Add the expanded range to the doc
      decoDoc._addDecoRange(expandedRange)
    })
  }

  /**
   * Return the cmDoc's code as a string, with whitespace removed. DecoRanges
   * returned do not have whitespace.
   *
   * @param  {DecoDoc} decoDoc
   * @param  {Pos} [from=Pos.MIN]
   * @param  {Pos} [to=Pos.MAX]
   * @return {code: String, decoRanges: DecoRanges[]}
   */
  static collapseWhitespace(decoDoc, from = Pos.MIN, to = Pos.MAX) {
    const decoRanges = decoDoc.getDecoRanges(from, to)

    if (decoRanges.length === 0) {
      return {
        code: decoDoc.cmDoc.getRange(from, to),
        decoRanges: [],
      }
    }

    const codeBlocks = []
    const rangesWithoutWhitespace = []

    const docStart = new DecoRange('sentinel', from, from)
    const docEnd = new DecoRange('sentinel', to, to)
    const iterableRanges = [docStart].concat(decoRanges).concat([docEnd])

    const spaceCountPerLine = {}

    for (let i = 0; i < iterableRanges.length - 1; i++) {
      const decoRange = iterableRanges[i]

      // If the decoRange is not a sentinel
      if (decoRange.id !== 'sentinel') {

        // Get the range within the whitespace
        const innerRange = decoRange.withoutWhitespace()

        // Compare the range to the selection, and only include the range if
        // it's entirely selected. Each boundary has 1 extra space
        let innerFrom = innerRange.from
        let innerTo = innerRange.to
        let fullyContained = true
        let spaces = 2

        if (N(innerRange.from) <= N(from)) {
          innerFrom = from
          fullyContained = false
          spaces--
        }

        if (N(innerRange.to) >= N(to)) {
          innerTo = to
          fullyContained = false
          spaces--
        }

        // Add code within the DecoRange
        const codeWithinDecoRange = decoDoc.cmDoc.getRange(innerFrom, innerTo)
        codeBlocks.push(codeWithinDecoRange)

        const spaceCount = spaceCountPerLine[innerRange.from.line] || 0
        spaceCountPerLine[innerRange.from.line] = spaceCount + spaces

        if (fullyContained) {

          // Create a new DecoRange without whitespace, offset by other whitespace deleted
          rangesWithoutWhitespace.push(new DecoRange(
            decoRange.id,
            new Pos(decoRange.from.line, decoRange.from.ch - spaceCount),
            new Pos(decoRange.to.line, decoRange.to.ch - spaceCount - 2),
          ))
        }
      }

      // Add code after this DecoRange and before the next
      const nextDecoRange = iterableRanges[i + 1]
      const codeUntilNextDecoRange = decoDoc.cmDoc.getRange(decoRange.to, nextDecoRange.from)
      codeBlocks.push(codeUntilNextDecoRange)
    }

    return {
      code: codeBlocks.join(''),
      decoRanges: _.invokeMap(rangesWithoutWhitespace, 'toJSON'),
    }
  }

}

DecoRangeUtils.DECO_RANGE_SORTBY = DECO_RANGE_SORTBY
DecoRangeUtils.SHIFT_DIRECTION = SHIFT_DIRECTION

export default DecoRangeUtils
