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

import Pos from '../models/editor/CodeMirrorPos'
import CodeMirrorRange from '../models/editor/CodeMirrorRange'
import {toCode, toValue} from './Parser'

export default class {

  static computePropCode(prop, value) {
    const {template} = prop

    if (template) {
      return _.template(template)({value})
    } else {
      return toCode(value)
    }
  }

  static getPropTextUpdate(decoDoc, elementProp, value, componentProp = {}) {
    const {cmDoc} = decoDoc

    // If componentProp is passed, override elementProp
    elementProp = {...elementProp, ...componentProp}

    const {valueStart, valueEnd} = elementProp
    const text = this.computePropCode(elementProp, value)
    const range = new CodeMirrorRange(valueStart, valueEnd)
    const newValue = toValue(text)

    return {text, range, value: newValue}
  }

  static removeProp(decoDoc, element, prop) {
    const {cmDoc} = decoDoc
    const {start, end} = prop
    const {openStart} = element

    cmDoc.replaceRange('', start, end)

    // Try to delete an empty line
    if (start.line === end.line && cmDoc.getLine(start.line).trim() === '') {
      cmDoc.replaceRange('', {ch: 0, line: start.line}, {ch: 0, line: start.line + 1})
    }

    cmDoc.setSelection(openStart)
  }

  static addProp(decoDoc, element, prop) {
    const {cmDoc} = decoDoc
    const {name, value} = prop
    const {openStart, openEnd, selfClosing} = element

    const code = this.computePropCode(prop, value)
    const endLength = selfClosing ? 2 : 1
    const indentStart = _.repeat(' ', openStart.ch)
    let text = `  ${name}={${code}}\n${indentStart}`

    // Single-line component, likely with no props
    if (openStart.line === openEnd.line) {
      text = `\n${indentStart}${text}`
    }

    cmDoc.replaceRange(text, {ch: openEnd.ch - endLength, line: openEnd.line})
    cmDoc.setSelection(openStart)
  }

}
