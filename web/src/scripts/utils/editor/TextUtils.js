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

export default class {

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
