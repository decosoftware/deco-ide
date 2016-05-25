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

import {
  enableTokenHighlighting,
  disableTokenHighlighting,
  addDecoRangeFromCMToken,
} from '../../actions/editorActions'

import Middleware from '../Middleware'
import CodeMirrorEventTypes from '../../constants/CodeMirrorEventTypes'
import N from '../../utils/simpleCodeMirrorPosition'

/**
 * Middleware for editing deco ranges
 */
class DecoRangeMiddleware extends Middleware {

  constructor() {
    super()

    this._keyMap = {
      [CodeMirrorEventTypes.beforeSelectionChange]: this._beforeSelectionChange.bind(this),
    }
  }

  get eventListeners() {
    return this._keyMap
  }

  _beforeSelectionChange(cm, selectionChange) {

    const {origin, ranges, update} = selectionChange

    // Assume exactly one selection range (for now)
    const afterRange = ranges[0]
    const afterFrom = afterRange.from()
    const afterTo = afterRange.to()

    const beforeRange = cm.listSelections()[0]
    const beforeFrom = beforeRange.from()
    const beforeTo = beforeRange.to()

    if (afterRange.empty()) {
      const decoRange = this._decoDoc.getDecoRangeForCMPos(afterFrom)

      // Have we entered a range? (either by click, or from a different line)
      if (decoRange) {
        this._decoDoc.enterDecoRange(decoRange)
      } else {

        const beforeDecoRange = this._decoDoc.getDecoRangeForCMPos(beforeFrom, true)
        const afterDecoRange = this._decoDoc.getDecoRangeForCMPos(afterFrom, true)

        // Have we jumped over a range? (when moving on the same line)
        if (beforeDecoRange && afterDecoRange &&
            beforeDecoRange.id === afterDecoRange.id &&
            ((N(beforeFrom) === N(beforeDecoRange.from) && N(beforeDecoRange.to) === N(afterFrom)) ||
              (N(afterFrom) === N(beforeDecoRange.from) && N(beforeDecoRange.to) === N(beforeFrom)))) {
          this._decoDoc.enterDecoRange(beforeDecoRange)

          let newFrom

          // Adjust range so the cursor only moves 1 position
          if (N(beforeFrom) < N(afterFrom)) {
            newFrom = new CodeMirror.Pos(beforeFrom.line, beforeFrom.ch + 1)
          } else {
            newFrom = new CodeMirror.Pos(beforeFrom.line, beforeFrom.ch - 1)
          }

          selectionChange.update([{anchor: newFrom, head: newFrom}])

        // Otherwise, we're not in a range
        } else {
          this._decoDoc.exitDecoRange()
        }
      }
    }
  }

  attach(decoDoc) {
    if (!decoDoc) {
      return
    }

    this._decoDoc = decoDoc
  }

  detach() {
    if (!this._decoDoc) {
      return
    }

    this._decoDoc = null
  }

}

const middleware = new DecoRangeMiddleware()

export default (dispatch) => {
  middleware.setDispatchFunction(dispatch)
  return middleware
}
