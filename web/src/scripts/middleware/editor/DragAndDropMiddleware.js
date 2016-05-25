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

import Middleware from '../Middleware'
import CodeMirrorEventTypes from '../../constants/CodeMirrorEventTypes'
import CodeMirrorToken from '../../models/editor/CodeMirrorToken'
import PrimitiveTypes from '../../constants/PrimitiveTypes'

/**
 * Middleware for highlighting and clicking specific token types
 */
class DragAndDropMiddleware extends Middleware {

  constructor() {
    super()

    this._markers = []
    this._keyMap = {}

    this.setHover = _.throttle(this.setHover.bind(this), 100)
  }

  get eventListeners() {
    return this._keyMap
  }

  _createBookmark(cmDoc, pos) {
    const widget = document.createElement('span')

    const widgetStyle = `
      background-color: #1680FA;
      width: 2px;
      height: 16px;
      position: absolute;
      top: 2px;
      display: inline-block;
    `

    widget.setAttribute('style', widgetStyle)

    return cmDoc.setBookmark(pos, {widget})
  }

  _markDocument(positions = []) {
    const cmDoc = this._decoDoc.cmDoc
    this._markers.forEach(marker => marker.clear())
    this._markers.length = 0

    _.each(positions, (pos) => {
      this._markers.push(this._createBookmark(cmDoc, pos))
    })
  }

  setHover(isOver, offset) {
    if (! this._decoDoc) {
      return
    }

    if (isOver) {
      const cm = this._decoDoc.cmDoc.getEditor()
      const pos = cm.coordsChar(offset, 'page')
      cm.setCursor(pos)
      this._markDocument([pos])
    } else {
      this._markDocument()
    }
  }

  attach(decoDoc) {
    if (! decoDoc) {
      return
    }

    this._decoDoc = decoDoc
  }

  detach() {
    if (! this._decoDoc) {
      return
    }

    this._decoDoc = null
  }

}

const middleware = new DragAndDropMiddleware()

export default (dispatch) => {
  middleware.setDispatchFunction(dispatch)
  return middleware
}
