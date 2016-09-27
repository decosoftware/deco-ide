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

const Clipboard = Electron.clipboard
import CodeMirror from 'codemirror'
import _ from 'lodash'

import * as liveValueActions from '../../actions/liveValueActions'
import * as textEditorCompositeActions from '../../actions/textEditorCompositeActions'

import Middleware from '../Middleware'
import { EventTypes } from '../../constants/CodeMirrorTypes'
import N from '../../utils/simpleCodeMirrorPosition'
import DecoRangeUtils from '../../utils/editor/DecoRangeUtils'
import LiveValueUtils from '../../utils/metadata/LiveValueUtils'
import DecoChangeFactory from '../../factories/editor/DecoChangeFactory'
import CodeMirrorChange from '../../models/editor/CodeMirrorChange'

/**
 * Middleware for handling copy and paste with DecoRanges
 */
export default class ClipboardMiddleware extends Middleware {

  handleCopy = (...args) => this.copy(false, ...args)

  handleCut = (...args) => this.copy(true, ...args)

  copy = (shouldDeleteSelection, e) => {
    if (!this.containsElement(e.target)) return

    // Get code and ranges for the current selection
    const copyRanges = _.map(this.linkedDoc.listSelections(), (nativeRange) => {
      const {code, decoRanges} = DecoRangeUtils.collapseWhitespace(
        this.decoDoc,
        nativeRange.from(),
        nativeRange.to()
      )

      // Shift ranges back to Pos(0,0)
      const shiftedDecoRanges = DecoRangeUtils.shiftDecoRanges(
        decoRanges,
        nativeRange.from(),
        DecoRangeUtils.SHIFT_DIRECTION.TOWARD_START
      )

      // Get live value data for ranges
      const liveValues = LiveValueUtils.denormalizeLiveValueMetadata(
        shiftedDecoRanges,
        this.liveValuesById
      )

      // Create custom deco json
      return {code, liveValues}
    })

    // Write both plain text and custom deco json to clipboard
    e.clipboardData.setData('text/plain', _.map(copyRanges, 'code').join('\n'))
    e.clipboardData.setData('application/deco', JSON.stringify({ ranges: copyRanges }))

    e.preventDefault()

    if (shouldDeleteSelection) {
      _.each(this.linkedDoc.listSelections(), (nativeRange) => {
        this.linkedDoc.replaceRange("", nativeRange.from(), nativeRange.to())
      })
    }
  }

  handlePaste = (e) => {
    if (!this.containsElement(e.target)) return

    const rawData = e.clipboardData.getData('application/deco')

    // Only handle paste manually if we're pasting deco content
    if (! rawData) return

    const {decoDoc, decoDoc: {id: fileId}, linkedDoc} = this

    const performPaste = ({code, liveValues}, nativeRange) => {

      // Get the current selection
      const from = nativeRange.from()
      const to = nativeRange.to()

      const {
        liveValuesById,
        liveValueIds,
        decoRanges,
      } = LiveValueUtils.normalizeLiveValueMetadata(liveValues)

      // Replace original text with new text
      const originalText = linkedDoc.getRange(from, to)
      const textChange = DecoChangeFactory.createChangeToSetText(from, to, code, originalText)

      // Shift ranges from Pos(0,0) to location of insertion
      const shiftedDecoRanges = DecoRangeUtils.shiftDecoRanges(
        decoRanges,
        from,
        DecoRangeUtils.SHIFT_DIRECTION.TOWARD_END
      )

      // Add ranges to doc
      const decoChange = DecoChangeFactory.createCompositeChange([
        textChange,
        DecoChangeFactory.createChangeToAddDecoRanges(shiftedDecoRanges),
      ])

      this.dispatch(liveValueActions.importLiveValues(fileId, liveValuesById))
      this.dispatch(textEditorCompositeActions.edit(fileId, decoChange))
    }

    // Unpack custom deco json
    const copyRanges = JSON.parse(rawData).ranges
    const selections = linkedDoc.listSelections()

    for (let i = 0; i < selections.length; i++) {
      const selection = selections[i]

      // If 1:1, copy each copyRange into its corresponding selection
      if (copyRanges.length === selections.length) {
        performPaste(copyRanges[i], selection)

      // Otherwise, copy all copyRanges into every selection
      } else {
        copyRanges.reverse().forEach((copyRange) => {
          performPaste(copyRange, selection)
        })
      }
    }

    e.preventDefault()
    e.stopPropagation()

    return false
  }

  attach(decoDoc, linkedDoc) {
    if (!decoDoc) return

    super.attach(decoDoc, linkedDoc)

    document.addEventListener('copy', this.handleCopy)
    document.addEventListener('cut', this.handleCut)
    document.addEventListener('paste', this.handlePaste, true)
  }

  detach() {
    if (!this.decoDoc) return

    super.detach()

    document.removeEventListener('copy', this.handleCopy)
    document.removeEventListener('cut', this.handleCut)
    document.removeEventListener('paste', this.handlePaste)
  }

  setLiveValuesById(liveValuesById) {
    this.liveValuesById = liveValuesById

    return this
  }

  containsElement(element) {
    if (!this.linkedDoc) return false

    return this.linkedDoc.cm.getWrapperElement().contains(element)
  }

}
