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

import * as textEditorCompositeActions from '../../actions/textEditorCompositeActions'
import Middleware from '../Middleware'
import { EventTypes } from '../../constants/CodeMirrorTypes'
import CodeMirrorToken from '../../models/editor/CodeMirrorToken'
import PrimitiveTypes from '../../constants/PrimitiveTypes'

const TOKEN_TYPES = [
  PrimitiveTypes.STRING,
  PrimitiveTypes.NUMBER,
  PrimitiveTypes.BOOLEAN,
]

/**
 * Middleware for highlighting and clicking specific token types
 */
export default class TokenMiddleware extends Middleware {

  constructor() {
    super()

    this.eventListeners = {
      [EventTypes.mouseDown]: this.mouseDown.bind(this),
    }
  }

  getTokenAt(cm, pos, precise = false) {
    const nativeToken = cm.getTokenAt(pos, precise)
    return CodeMirrorToken.fromNativeToken(nativeToken, pos.line)
  }

  findNearestLiteralToken(cm, pos) {
    let token = this.getTokenAt(cm, pos)

    // Clicks on the left side of a char (xRel === 1) identify the previous token.
    // If the token at `pos` is not interesting, try the next char.
    if (pos.xRel === 1 && token.type === '') {
      const nextPos = new CodeMirror.Pos(pos.line, pos.ch + 1)
      token = this.getTokenAt(cm, pos)
    }

    return token
  }

  mouseDown(cm, e) {
    if (!e.altKey) return

    e.stopPropagation()
    e.preventDefault()

    const clickCoords = {
      left: e.pageX,
      top: e.pageY,
    }

    const clickPos = cm.coordsChar(clickCoords, 'page')
    const token = this.findNearestLiteralToken(cm, clickPos)

    if (token.type && TOKEN_TYPES.indexOf(token.type) >= 0) {
      this.dispatch(textEditorCompositeActions.addDecoRangeFromCMToken(this.decoDoc.id, token))
    }
  }

}
