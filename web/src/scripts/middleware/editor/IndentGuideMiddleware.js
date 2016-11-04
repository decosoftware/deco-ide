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
import { EventEmitter } from 'events'
import CodeMirror from 'codemirror'

import Middleware from '../Middleware'
import { EventTypes } from '../../constants/CodeMirrorTypes'
import Pos from '../../models/editor/CodeMirrorPos'
import StyleNode from '../../utils/StyleNode'

const MAX_GUIDE_DEPTH = 32
const WORK_PER_FRAME = 2

// Emit changes on CodeMirror option changes
const optionsEmitter = new EventEmitter()

CodeMirror.defineOption('showIndentGuides', false, (cm, val, old) => {

  const prev = old && old != CodeMirror.Init;
  if (val && ! prev) {
    const indentUnit = cm.getOption('indentUnit')

    // Reset CodeMirror's cached character dimensions, since they may be stale
    cm.display.cachedCharWidth = null
    cm.display.cachedTextHeight = null

    // Get character dimensions
    const charWidth = cm.defaultCharWidth()
    const textHeight = cm.defaultTextHeight()

    optionsEmitter.emit('enabled', cm, indentUnit, charWidth, textHeight)
  } else if (! val && prev) {
    optionsEmitter.emit('disabled', cm)
  }
})


/**
 * Middleware for showing indent guides
 */
export default class IndentGuideMiddleware extends Middleware {

  constructor() {
    super()

    this.styleNode = new StyleNode()

    this.indentSize = 2

    // ClassNames to add
    this.classQueue = {}

    // Existing classes on lines - current state of the DOM
    this.lineCache = {}

    // ClassNames to delete
    this.deletionQueue = {}

    this.eventListeners = {
      [EventTypes.renderLine]: this.renderLine,
    }
  }

  getClassName = (text) => {
    const {indentSize} = this

    const whitespace = typeof text === 'number' ? text : text.search(/\S|$/) + 1
    const indentCount = Math.floor(whitespace / indentSize) * indentSize

    return `cm-indent-guide-${indentCount}`
  }

  renderLine = (cm, lineHandle, element) => {
    const {text, stateAfter} = lineHandle

    let className

    // If there are any non-whitespace characters, count indentation and determine className
    if (text.match(/\S/)) {
      className = this.getClassName(text)

    // Else, use syntax highlighter's indentation level
    } else {
      const indent = _.get(stateAfter, 'context.state.indented', 0)
      className = this.getClassName(indent)
    }

    element.classList.add(className)
  }

  enable = (cm, indentUnit, charWidth, textHeight) => {
    this.showIndentGuides = true
    this.attachStyles(indentUnit, charWidth, textHeight)
  }

  disable = (cm) => {
    this.showIndentGuides = false
    this.detachStyles()
  }

  attach(...args) {
    super.attach(...args)

    optionsEmitter.on('enabled', this.enable)
    optionsEmitter.on('disabled', this.disable)
  }

  detach() {
    optionsEmitter.removeListener('enabled', this.enable)
    optionsEmitter.removeListener('disabled', this.disable)

    super.detach()
  }

  // Generate an indent guide
  getBackgroundStyles(i, charWidth, textHeight) {
    return {
      ['background']: `linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.1))`,
      ['background-size']: `1px ${textHeight}px`,
      ['background-repeat']: `no-repeat`,
      ['background-position']: `${charWidth * i}px 0px`,
    }
  }

  // Use multiple backgrounds to make `n` indent guides
  getBackgroundStylesRepeated(n, indentSize, charWidth, textHeight) {
    const styles = {
      ['background']: [],
      ['background-size']: [],
      ['background-repeat']: [],
      ['background-position']: [],
    }

    for (let i = 0; i <= n; i++) {
      if (i % indentSize !== 0) {
        continue
      }

      const style = this.getBackgroundStyles(i, charWidth, textHeight)
      styles['background'].push(style['background'])
      styles['background-size'].push(style['background-size'])
      styles['background-repeat'].push(style['background-repeat'])
      styles['background-position'].push(style['background-position'])
    }

    return {
      ['background']: `${styles['background'].join(', ')}`,
      ['background-size']: `${styles['background-size'].join(', ')}`,
      ['background-repeat']: `${styles['background-repeat'].join(', ')}`,
      ['background-position']: `${styles['background-position'].join(', ')}`,
    }
  }

  attachStyles(indentSize, charWidth, textHeight) {
    const rules = []
    for (let i = 0; i <= MAX_GUIDE_DEPTH; i++) {
      if (i % indentSize !== 0) {
        continue
      }

      const styles = this.getBackgroundStylesRepeated(i - 1, indentSize, charWidth, textHeight)
      rules.push(
        `.cm-indent-guide-${i}::before {
          position: absolute;
          width: 100%;
          height: 100%;
          content: "";
          background: ${styles['background']};
          background-size: ${styles['background-size']};
          background-repeat: ${styles['background-repeat']};
          background-position: ${styles['background-position']};
        }`
      )
    }

    this.styleNode.setText(rules.join('\n'))
    this.styleNode.attach()
  }

  detachStyles() {
    this.styleNode.detach()
  }

}
