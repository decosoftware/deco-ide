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

class CodeMirrorChange {

  constructor(from, to, text, originalText, origin = '') {

    // Automatically wrap strings as arrays
    if (typeof text === 'string') {
      text = text.split('\n')
    }

    if (typeof text === 'string') {
      originalText = originalText.split('\n')
    }

    this._from = from
    this._to = to
    this._text = text
    this._originalText = originalText
    this._origin = origin
  }

  get from() {
    return this._from
  }

  get to() {
    return this._to
  }

  get text() {
    return this._text
  }

  get originalText() {
    return this._originalText
  }

  get origin() {
    return this._origin
  }

  get removed() {
    return this._originalText
  }

  invert() {
    const updatedTo = CodeMirror.changeEnd(this)
    const inverted = new CodeMirrorChange(
      this.from,
      updatedTo,
      this.originalText,
      this.text,
      this.origin
    )
    return inverted
  }

  /*** SERIALIZATION ***/

  toJSON() {
    return {
      from: this._from,
      to: this._to,
      text: this._text,
      originalText: this._originalText,
      origin: this._origin,
    }
  }

  static fromJSON(json) {
    return new CodeMirrorChange(
      json.from,
      json.to,
      json.text,
      json.originalText,
      json.origin
    )
  }

  clone() {
    return CodeMirrorChange.fromJSON(this.toJSON())
  }

}

export default CodeMirrorChange
