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
import {toCode} from '../Parser'

export default class {

  static computePropCode(prop, value) {
    const {template} = prop

    if (template) {
      return _.template(template)({value})
    } else {
      return toCode(value)
    }
  }

  static changePropValue(decoDoc, elementProp, value, componentProp = {}) {
    const {cmDoc} = decoDoc

    // If componentProp is passed, override elementProp
    elementProp = {...elementProp, ...componentProp}

    const {valueStart, valueEnd} = elementProp
    const code = this.computePropCode(elementProp, value)
    cmDoc.replaceRange(code, valueStart, valueEnd)
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

  static addProp(decoDoc, element, prop, value) {
    const {cmDoc} = decoDoc
    const {name, defaultValue, template} = prop
    const {openStart, openEnd, selfClosing} = element

    if (_.isUndefined(value)) {
      value = this.computePropCode(prop, defaultValue)
    } else {
      value = this.computePropCode(prop, value)
    }

    const endLength = selfClosing ? 2 : 1
    const indentStart = _.repeat(' ', openStart.ch)
    let text = `  ${name}={${value}}\n${indentStart}`

    // Single-line component, likely with no props
    if (openStart.line === openEnd.line) {
      text = `\n${indentStart}${text}`
    }

    cmDoc.replaceRange(text, {ch: openEnd.ch - endLength, line: openEnd.line})
    cmDoc.setSelection(openStart)
  }

  static countIndentation(string) {
    return string.search(/\S|$/)
  }

  static ensureNewlineWithIndentation(cmDoc) {

    // Get the cm instance and cursor
    const cm = cmDoc.getEditor()
    const cursor = cmDoc.getCursor()
    const {line, ch} = cursor

    // Identify the char before and after
    const charBefore = cmDoc.getRange({line, ch: ch - 1}, cursor)

    // If there's something before, we probably want a newline and indent first
    if (charBefore !== '' && charBefore !== ' ') {

      // Count the indentation
      const beforeLineText = cmDoc.getLine(line)
      const indent = this.countIndentation(beforeLineText)

      // Add a newline and indent
      cmDoc.replaceRange('\n', cursor)
      cm.indentLine(line + 1, 'smart', true)

      // Set the cursor at the indentation on the next line
      cmDoc.setCursor({line: line + 1, ch: Pos.MAX_CH})
    }

    // TODO handle after case?
    // const charAfter = cmDoc.getRange(cursor, {line, ch: ch + 1})
  }

  static indent(cm) {

    const indentUnit = cm.getOption('indentUnit')

    // TODO operation has no effect here because watching 'beforeChange' in
    // HistoryMiddleware happens at the 'change' level. Fix somehow...
    cm.operation(() => {
      const ranges = cm.listSelections()
      for (let i = ranges.length - 1; i >= 0; i--) {
        const from = ranges[i].from()
        const to = ranges[i].to()

        const singleLine = from.line === to.line

        if (singleLine) {
          const indentCount = this.countIndentation(cm.getLine(from.line))

          cm.indentLine(from.line, 'smart', true)

          // Correct a smart indent issue where lines can't be indented.
          // If a line would be un-indented, just increment instead of 'smart'
          const newIndentCount = this.countIndentation(cm.getLine(from.line))
          if (newIndentCount <= indentCount) {
            cm.replaceRange(_.repeat(' ', indentCount - newIndentCount + 2), Pos(from.line, 0))
          }
        } else {
          for (let j = from.line; j <= to.line; ++j) {
            cm.indentLine(j, indentUnit)
          }
        }
      }
    })
  }
}
