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
const LINE_PADDING = 4
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
      [EventTypes.viewportChange]: this.viewportChange,
      [EventTypes.swapDoc]: this.swapDoc,
      [EventTypes.changes]: this.changes,
    }
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
      ['background-position']: `${LINE_PADDING + i * charWidth}px 0px`,
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

  // Add and remove classes from the DOM.
  // Distribute over multiple frames so scrolling remains fast.
  updateClasses(cm) {
    const addedLineIndexes = []
    const deletedLineIndexes = []
    let addedCount = 0
    let deletedCount = 0
    let shouldCallAgain = false

    // Remove classes from the DOM
    _.each(this.deletionQueue, (_, i) => {

      // Cast i to number (it's an object key initially)
      i = +i

      cm.removeLineClass(i, 'background', this.lineCache[i])
      delete this.lineCache[i]

      deletedLineIndexes.push(i)
      deletedCount++

      if (deletedCount > WORK_PER_FRAME) {
        shouldCallAgain = true

        // Exit iteration early
        return false
      }
    })

    // Add classes to the DOM
    _.each(this.classQueue, (className, i) => {

      // Cast i to number (it's an object key initially)
      i = +i

      // Remove previous className
      if (this.lineCache[i]) {
        cm.removeLineClass(i, 'background', this.lineCache[i])
      }

      cm.addLineClass(i, 'background', className)
      this.lineCache[i] = className
      addedLineIndexes.push(i)
      addedCount++

      if (addedCount > WORK_PER_FRAME) {
        shouldCallAgain = true

        // Exit iteration early
        return false
      }
    })

    // Update the queue
    _.each(addedLineIndexes, (key) => {
      delete this.classQueue[key]
    })

    // Update the queue
    _.each(deletedLineIndexes, (key) => {
      delete this.deletionQueue[key]
    })

    if (shouldCallAgain) {
      window.requestAnimationFrame(this.updateClasses.bind(this, cm))
    }
  }

  enqueueClassUpdates(cm, fromLine, toLine) {
    if (! this.showIndentGuides) {
      return
    }

    _.each(this.lineCache, (_, i) => {
      i = +i

      if (i <= fromLine || i >= toLine) {
        this.deletionQueue[i] = true
      }
    })

    _.each(this.classQueue, (_, i) => {
      i = +i

      if (i <= fromLine || i >= toLine) {
        delete this.classQueue[i]
      }
    })

    for (let i = fromLine; i <= toLine; i++) {
      const text = cm.getRange({line: i, ch: 0}, {line: i, ch: MAX_GUIDE_DEPTH + 1})

      let className

      // If empty line, use previous line's indent count
      if (text === '') {
        className = this.classQueue[i - 1] || this.lineCache[i - 1]

      // Else, count indentation and determine className
      } else {
        const whitespace = text.search(/\S|$/) + 1
        const indentCount = Math.floor(whitespace / this.indentSize) * this.indentSize
        className = 'cm-indent-guide-' + indentCount
      }

      // Add the className to the queue, if it doesn't already exist
      if (className &&
          className !== this.classQueue[i] &&
          (className !== this.lineCache[i] || this.deletionQueue[i])) {

        this.classQueue[i] = className
      }
    }

    if (_.size(this.classQueue) || _.size(this.deletionQueue)) {
      window.requestAnimationFrame(this.updateClasses.bind(this, cm))
    }
  }

  enqueueRemoveAllClasses(cm) {
    this.classQueue = {}

    // Mark all existing classes for deletion
    Object.assign(this.deletionQueue, this.lineCache)

    if (_.size(this.deletionQueue)) {
      window.requestAnimationFrame(this.updateClasses.bind(this, cm))
    }
  }

  enqueueViewportUpdate(cm) {
    const {from, to} = cm.getViewport()
    this.enqueueClassUpdates(cm, from, to)
  }

  viewportChange = (cm, fromLine, toLine) => {
    this.enqueueClassUpdates(cm, fromLine, toLine)
  }

  // On change, invalidate all lines below the start of the change closest to
  // the top of the file.
  changes = (cm, changes) => {
    const sortedChanges = _.sortBy(changes, ['from.line'])
    const fromLine = sortedChanges[0].from.line

    _.each(this.lineCache, (_, i) => {
      i = +i

      if (i >= fromLine) {
        this.deletionQueue[i] = true
      }
    })

    _.each(this.classQueue, (_, i) => {
      i = +i

      if (i >= fromLine) {
        delete this.classQueue[i]
      }
    })

    this.enqueueViewportUpdate(cm)
  }

  swapDoc = (cm) => {
    this.classQueue = {}
    this.enqueueViewportUpdate(cm)
  }

}
