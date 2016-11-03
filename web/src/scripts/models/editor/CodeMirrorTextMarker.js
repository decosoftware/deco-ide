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

import uuid from '../../utils/uuid'

import CodeMirrorRange from './CodeMirrorRange'

const CLASSNAME = {
  DEFAULT: 'editor-lv',
  ACTIVE: 'editor-lv editor-lv-active',
  START: 'editor-lv-start',
  END: 'editor-lv-end',
}

class CodeMirrorTextMarker {

  constructor(id) {
    if (! id) {
      throw new Error(`Must construct CodeMirrorTextMarker with id`)
    }

    this._id = id

    this._className = CLASSNAME.DEFAULT
    this._inclusiveLeft = true
    this._inclusiveRight = true
    this._atomic = false
    this._collapsed = false
    this._clearOnEnter = false
    this._clearWhenEmpty = false
    this._replacedWith = null
    this._handleMouseEvents = false
    this._readOnly = false
    this._addToHistory = false
    this._startStyle = CLASSNAME.START
    this._endStyle = CLASSNAME.END
    this._css = null
    this._title = 'Live Value'
    this._shared = true
  }

  get id() {
    return this._id
  }

  get nativeId() {
    if (! this._nativeMarker) {
      throw new Error(`Can't get nativeId - native marker not attached`)
    }

    // Markers have an id. Shared markers don't have an id, but are linked to a
    // primary marker, so use that id.
    return this._nativeMarker.id || this._nativeMarker.primary.id
  }

  attachToNativeDocAtRange(cmDoc, cmRange) {
    if (this._nativeMarker) {
      throw new Error('native marker already attached')
    }

    const options = {
      className: this._className,
      inclusiveLeft: this._inclusiveLeft,
      inclusiveRight: this._inclusiveRight,
      atomic: this._atomic,
      collapsed: this._collapsed,
      clearOnEnter: this._clearOnEnter,
      clearWhenEmpty: this._clearWhenEmpty,
      replacedWith: this._replacedWith,
      handleMouseEvents: this._handleMouseEvents,
      readOnly: this._readOnly,
      addToHistory: this._addToHistory,
      startStyle: this._startStyle,
      endStyle: this._endStyle,
      css: this._css,
      title: this._title,
      shared: this._shared,
    }

    this._nativeMarker = cmDoc.markText(cmRange.from, cmRange.to, options)
  }

  detachFromNativeDoc() {
    if (! this._nativeMarker) {
      throw new Error('native marker not attached')
    }

    this._nativeMarker.clear()

    delete this._nativeMarker
  }

  get cmRange() {
    const {from, to} = this._nativeMarker.find()
    return new CodeMirrorRange(from, to)
  }

  get atomic() {
    return this._atomic
  }

  set atomic(value) {
    if (this._atomic === value) {
      return
    }

    this._atomic = value
    this._className = this._atomic ? CLASSNAME.DEFAULT : CLASSNAME.ACTIVE

    // Delete and recreate native TextMarker
    if (this._nativeMarker) {
      const cmRange = this.cmRange
      const cmDoc = this._nativeMarker.doc
      this.detachFromNativeDoc()
      this.attachToNativeDocAtRange(cmDoc, cmRange)
    }
  }

}

export default CodeMirrorTextMarker
