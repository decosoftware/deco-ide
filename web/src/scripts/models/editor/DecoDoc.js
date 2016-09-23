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

import N from '../../utils/simpleCodeMirrorPosition'
import CodeMirrorDocWrapper from './CodeMirrorDocWrapper'
import Pos from './CodeMirrorPos'
import DecoRange from './DecoRange'
import DecoRangeUtils, {DECO_RANGE_SORTBY, } from '../../utils/editor/DecoRangeUtils'
import {CHANGE_TYPE, } from './DecoChange'
import {RANGE_CHANGE_TYPE, } from './DecoRangeChange'
import Lock from './Lock'

/**
 * A Deco wrapper for a CodeMirror document.
 *
 * Contains information about metadata ranges, which are used to power Live Values.
 */
class DecoDoc extends CodeMirrorDocWrapper {

  constructor(id, code, mode, decoRanges = []) {
    super(code, mode)
    this._id = id
    this._mode = mode
    this._lock = new Lock()
    this._activeDecoRangeId = null

    decoRanges.forEach(this._addDecoRange.bind(this))
  }

  set id(newId) {
    this._id = newId
  }

  get id() {
    return this._id
  }

  get locked() {
    return this._lock.locked
  }

  get code() {
    return this.cmDoc.getValue()
  }

  set code(value) {
    throw new Error('this replaces ranges')
  }

  /*** EDITING ***/

  edit(decoChange) {

    // _nativeDoc.cm will only exist if the document has been loaded into a CM editor.
    // If it doesn't exist, there's no need to run an operation because batching
    // is just for DOM performance
    if (this._nativeDoc.cm) {

      // Batch changes in an operation - CodeMirror will only refresh the DOM
      // and fire certain events once all changes have completed. This dramatically
      // improves the performance of composite changes
      this._nativeDoc.cm.operation(() => {
        this._edit(decoChange)
      })
    } else {
      this._edit(decoChange)
    }
  }

  _edit(decoChange) {
    switch (decoChange.type) {
      case CHANGE_TYPE.TEXT:
        this._performCMChange(decoChange.cmChange)
      break
      case CHANGE_TYPE.RANGE:
        switch (decoChange.rangeChangeType) {
          case RANGE_CHANGE_TYPE.ADD:
            this._addDecoRange(decoChange.decoRange)
          break
          case RANGE_CHANGE_TYPE.REMOVE:
            this._removeDecoRange(decoChange.decoRange)
          break
        }
      break
      case CHANGE_TYPE.COMPOSITE:
        _.each(decoChange.subChanges, (subChange) => {
          this._edit(subChange)
        })
      break
    }
  }

  _performCMChange(cmChange) {
    this._lock.lock()

    const {from, to, text, origin} = cmChange
    this.cmDoc.replaceRange(text, from, to, origin)

    this._lock.unlock()
  }

  toJSON() {
    return {
      _id: this._id,
      _decoRanges: this._decoRanges,
      _lock: this._lock,
    }
  }

  /*** LIVE VALUES ***/

  getDecoRange(id) {
    const cmRange = this.getCMRange(id)
    if (cmRange) {
      return new DecoRange(id, cmRange.from, cmRange.to)
    } else {
      return null
    }
  }

  getDecoRanges(from = Pos.MIN, to = Pos.MAX, inclusive = false) {
    return _.chain(this.getCMRangeAndIdPairs(from, to, inclusive))
      .map(([id, cmRange]) => {
        return new DecoRange(id, cmRange.from, cmRange.to)
      })
      .sortBy(DECO_RANGE_SORTBY)
      .value()
  }

  get decoRanges() {
    return this.getDecoRanges()
  }

  _addDecoRange(decoRange) {
    this.addCMRange(decoRange.id, decoRange)
  }

  _removeDecoRange(decoRange) {
    if (this._activeDecoRangeId === decoRange.id) {
      this._activeDecoRangeId = null
    }

    this.removeCMRange(decoRange.id)
  }

  getDecoRangeForCMPos(cmPos, inclusive = false) {
    const pos = N(cmPos)
    return _.find(this.decoRanges, (decoRange) => {
      let from = N(decoRange.from)
      let to = N(decoRange.to)
      if (inclusive) {
        return from <= pos && pos <= to
      } else {
        return from < pos && pos < to
      }
    })
  }

  getCodeForDecoRanges() {
    return _.map(this.decoRanges, (decoRange) => {
      const codeWithinDecoRange = this.getCodeForDecoRange(decoRange.id)

      return {
        code: codeWithinDecoRange,
        id: decoRange.id,
      }
    })
  }

  getCodeForDecoRange(id) {
    const decoRange = this.getDecoRange(id)
    return this.cmDoc.getRange(decoRange.from, decoRange.to)
  }

  getCodeForRange(cmRange) {
    return this.cmDoc.getRange(cmRange.from, cmRange.to)
  }

  /*** SERIALIZATION ***/

  /**
  * Return the code, minus DecoRange whitespace
  *
  * @return {String}
  */
  toJSON() {
    return Object.assign({
      id: this.id,
      mode: this._mode,
    }, DecoRangeUtils.collapseWhitespace(this))
  }

  static fromJSON(json) {
    return new DecoDoc(json.id, json.code, json.mode, json.decoRanges)
  }
}

export default DecoDoc
