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
import { EventTypes } from '../../constants/CodeMirrorTypes'
import CodeMirrorToken from '../../models/editor/CodeMirrorToken'
import PrimitiveTypes from '../../constants/PrimitiveTypes'

const styles = {
  widget: `
    background-color: #1680FA;
    width: 2px;
    height: 16px;
    position: absolute;
    top: 2px;
    display: inline-block;
  `,
}

/**
 * Middleware for highlighting and clicking specific token types
 */
export default class DragAndDropMiddleware extends Middleware {

  constructor() {
    super()

    this.markers = []
  }

  createBookmark(linkedDoc, pos) {
    const widget = document.createElement('span')
    widget.setAttribute('style', styles.widget)

    return linkedDoc.setBookmark(pos, {widget})
  }

  markDocument(positions = []) {
    const {linkedDoc, markers} = this

    markers.forEach(marker => marker.clear())
    markers.length = 0

    positions.forEach((pos) => {
      markers.push(this.createBookmark(linkedDoc, pos))
    })
  }

  setHover = _.throttle((isOver, offset) => {
    if (!this.linkedDoc) return

    if (isOver) {
      const cm = this.linkedDoc.getEditor()
      const pos = cm.coordsChar(offset, 'page')
      cm.setCursor(pos)
      this.markDocument([pos])
    } else {
      this.markDocument()
    }
  }, 100)

}
