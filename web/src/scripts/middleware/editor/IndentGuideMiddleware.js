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
import CodeMirror from 'codemirror'

import Middleware from '../Middleware'
import CodeMirrorEventTypes from '../../constants/CodeMirrorEventTypes'
import Pos from '../../models/editor/CodeMirrorPos'

const MAX_GUIDE_DEPTH = 32
const CHAR_WIDTH = 7.1875
const LINE_PADDING = 4
const WORK_PER_FRAME = 2

/**
 * Middleware for showing indent guides
 */
class IndentGuideMiddleware extends Middleware {

  constructor() {
    super()

    this._indentSize = 2
    this._showIndentGuides = false
    this._appendStyles(this._indentSize)

    // ClassNames to add
    this._classQueue = {}

    // Existing classes on lines - current state of the DOM
    this._lineCache = {}

    // ClassNames to delete
    this._deletionQueue = {}

    this._keyMap = {
      [CodeMirrorEventTypes.viewportChange]: this._viewportChange.bind(this),
      [CodeMirrorEventTypes.swapDoc]: this._swapDoc.bind(this),
      [CodeMirrorEventTypes.changes]: this._changes.bind(this),
    }
  }

  get eventListeners() {
    return this._keyMap
  }

  setIndentGuides(value) {
    this._showIndentGuides = value
  }

  // Generate an indent guide
  _getBackgroundStyles(i) {
    return {
      ['background']: `linear-gradient(rgba(255,255,255,0.1), rgba(255,255,255,0.1))`,
      ['background-size']: `1px 21px`,
      ['background-repeat']: `no-repeat`,
      ['background-position']: `${LINE_PADDING + i * CHAR_WIDTH}px 0px`,
    }
  }

  // Use multiple backgrounds to make `n` indent guides
  _getBackgroundStylesRepeated(n, indentSize) {
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

      const style = this._getBackgroundStyles(i)
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

  _appendStyles(indentSize) {
    const styleNode = document.createElement('style');

    const rules = []
    for (let i = 0; i <= MAX_GUIDE_DEPTH; i++) {
      if (i % indentSize !== 0) {
        continue
      }

      const styles = this._getBackgroundStylesRepeated(i - 1, indentSize)
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

    styleNode.textContent = rules.join('\n')

    document.head.appendChild(styleNode);
  }

  // Add and remove classes from the DOM.
  // Distribute over multiple frames so scrolling remains fast.
  _updateClasses(cm) {
    const addedLineIndexes = []
    const deletedLineIndexes = []
    let addedCount = 0
    let deletedCount = 0
    let shouldCallAgain = false

    // Remove classes from the DOM
    _.each(this._deletionQueue, (_, i) => {

      // Cast i to number (it's an object key initially)
      i = +i

      cm.removeLineClass(i, 'background', this._lineCache[i])
      delete this._lineCache[i]

      deletedLineIndexes.push(i)
      deletedCount++

      if (deletedCount > WORK_PER_FRAME) {
        shouldCallAgain = true

        // Exit iteration early
        return false
      }
    })

    // Add classes to the DOM
    _.each(this._classQueue, (className, i) => {

      // Cast i to number (it's an object key initially)
      i = +i

      // Remove previous className
      if (this._lineCache[i]) {
        cm.removeLineClass(i, 'background', this._lineCache[i])
      }

      cm.addLineClass(i, 'background', className)
      this._lineCache[i] = className
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
      delete this._classQueue[key]
    })

    // Update the queue
    _.each(deletedLineIndexes, (key) => {
      delete this._deletionQueue[key]
    })

    if (shouldCallAgain) {
      window.requestAnimationFrame(this._updateClasses.bind(this, cm))
    }
  }

  _enqueueClassUpdates(cm, fromLine, toLine) {
    if (! this._showIndentGuides) {
      return
    }

    _.each(this._lineCache, (_, i) => {
      i = +i

      if (i <= fromLine || i >= toLine) {
        this._deletionQueue[i] = true
      }
    })

    _.each(this._classQueue, (_, i) => {
      i = +i

      if (i <= fromLine || i >= toLine) {
        delete this._classQueue[i]
      }
    })

    for (let i = fromLine; i <= toLine; i++) {
      const text = cm.getRange({line: i, ch: 0}, {line: i, ch: MAX_GUIDE_DEPTH + 1})

      let className

      // If empty line, use previous line's indent count
      if (text === '') {
        className = this._classQueue[i - 1] || this._lineCache[i - 1]

      // Else, count indentation and determine className
      } else {
        const whitespace = text.search(/\S|$/) + 1
        const indentCount = Math.floor(whitespace / this._indentSize) * this._indentSize
        className = 'cm-indent-guide-' + indentCount
      }

      // Add the className to the queue, if it doesn't already exist
      if (className &&
          className !== this._classQueue[i] &&
          (className !== this._lineCache[i] || this._deletionQueue[i])) {

        this._classQueue[i] = className
      }
    }

    if (_.size(this._classQueue) || _.size(this._deletionQueue)) {
      window.requestAnimationFrame(this._updateClasses.bind(this, cm))
    }
  }

  enqueueRemoveAllClasses(cm) {
    this._classQueue = {}

    // Mark all existing classes for deletion
    Object.assign(this._deletionQueue, this._lineCache)

    if (_.size(this._deletionQueue)) {
      window.requestAnimationFrame(this._updateClasses.bind(this, cm))
    }
  }

  enqueueViewportUpdate(cm) {
    const {from, to} = cm.getViewport()
    this._enqueueClassUpdates(cm, from, to)
  }

  _viewportChange(cm, fromLine, toLine) {
    this._enqueueClassUpdates(cm, fromLine, toLine)
  }

  // On change, invalidate all lines below the start of the change closest to
  // the top of the file.
  _changes(cm, changes) {
    const sortedChanges = _.sortBy(changes, ['from.line'])
    const fromLine = sortedChanges[0].from.line

    _.each(this._lineCache, (_, i) => {
      i = +i

      if (i >= fromLine) {
        this._deletionQueue[i] = true
      }
    })

    _.each(this._classQueue, (_, i) => {
      i = +i

      if (i >= fromLine) {
        delete this._classQueue[i]
      }
    })

    this.enqueueViewportUpdate(cm)
  }

  _swapDoc(cm) {
    this._classQueue = {}
    this.enqueueViewportUpdate(cm)
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

const middleware = new IndentGuideMiddleware()

CodeMirror.defineOption('showIndentGuides', false, (cm, val, old) => {
  middleware.setIndentGuides(val)

  const prev = old && old != CodeMirror.Init;
  if (val && ! prev) {
    middleware.enqueueViewportUpdate(cm)
  } else if (! val && prev) {
    middleware.enqueueRemoveAllClasses(cm)
  }
})

export default (dispatch) => {
  middleware.setDispatchFunction(dispatch)
  return middleware
}
