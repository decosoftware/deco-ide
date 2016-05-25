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
import _ from 'lodash'

import CodeMirrorTextMarker from './CodeMirrorTextMarker'
import N from '../../utils/simpleCodeMirrorPosition'

class CodeMirrorDocWrapper {

  constructor(code, mode) {
    this._nativeDoc = new CodeMirror.Doc(code, mode)
    this._cmTextMarkers = {}
  }

  get cmDoc() {
    return this._nativeDoc
  }

  /*** CLEAN/DIRTY STATE ***/

  isClean(changeId) {
    return this._nativeDoc.isClean(changeId)
  }

  markClean() {
    this._nativeDoc.markClean()
  }

  changeGeneration(changeId) {
    return this._nativeDoc.changeGeneration(changeId)
  }

  /*** TEXT MARKERS ***/

  /**
   * Get CMRanges in nativeDoc
   * @return Array[String, CodeMirrorRange]
   */
  getCMRangeAndIdPairs(from, to, inclusive = false) {
    const nativeIds = {}
    _.each(this._cmTextMarkers, (cmTextMarker) => {
      nativeIds[cmTextMarker.nativeId] = cmTextMarker
    })

    let nativeMarks
    if (from && to) {
      nativeMarks = this._nativeDoc.findMarks(from, to)
    } else {
      nativeMarks = this._nativeDoc.getAllMarks()
    }

    return _.chain(nativeMarks)
      .map((nativeMark) => nativeIds[nativeMark.id])
      .filter()
      .filter((cmTextMarker) => {
        const {from: markerFrom, to: markerTo} = cmTextMarker.cmRange

        // CodeMirror only supports the inclusive behavior, so we check manually
        if (! inclusive) {
          if (N(markerFrom) === N(to) || N(markerTo) === N(from)) {
            return false
          }
        }

        return true
      })
      .map((cmTextMarker) => [cmTextMarker.id, cmTextMarker.cmRange])
      .value()
  }

  getCMRange(id) {
    if (! this._cmTextMarkers[id]) {
      throw new Error(`Get CMRange ${id} failed, not in CMDoc`)
    }

    return this._cmTextMarkers[id].cmRange
  }

  addCMRange(id, cmRange) {
    if (this._cmTextMarkers[id]) {
      throw new Error(`CMRange ${id} already in CMDoc`)
    }

    const cmTextMarker = new CodeMirrorTextMarker(id)
    cmTextMarker.attachToNativeDocAtRange(this.cmDoc, cmRange)

    this._cmTextMarkers[id] = cmTextMarker
  }

  removeCMRange(id) {
    if (! this._cmTextMarkers[id]) {
      throw new Error(`CMRange ${id} not in CMDoc`)
    }

    const cmTextMarker = this._cmTextMarkers[id]
    cmTextMarker.detachFromNativeDoc()

    delete this._cmTextMarkers[id]
  }

  _setCMRangeAtomic(id, atomic) {
    if (! this._cmTextMarkers[id]) {
      throw new Error(`Cannot enter/exit - CMRange ${id} not in CMDoc`)
    }

    const cmTextMarker = this._cmTextMarkers[id]
    cmTextMarker.atomic = atomic
  }

  enterCMRange(id) {
    this._setCMRangeAtomic(id, false)
  }

  exitCMRange(id) {
    this._setCMRangeAtomic(id, true)
  }

}

export default CodeMirrorDocWrapper
