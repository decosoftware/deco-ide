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
import { bindActionCreators } from 'redux'
import { batchActions } from 'redux-batched-subscribe'

const FlowController = Electron.remote.require('./process/flowController.js')
import Middleware from '../Middleware'
import { EventTypes } from '../../constants/CodeMirrorTypes'
import Pos from '../../models/editor/CodeMirrorPos'
import ASTUtils from '../../utils/ASTUtils'
import ElementTreeBuilder from '../../utils/ElementTreeBuilder'
import { astActions, elementTreeActions } from '../../actions'
import * as uiActions from '../../actions/uiActions'

/**
 * Middleware for building an AST from the file
 */
class ASTMiddleware extends Middleware {

  constructor() {
    super()

    this.keyMap = {
      [EventTypes.changes]: this.changes,
      [EventTypes.swapDoc]: this.swapDoc,
      [EventTypes.cursorActivity]: this.cursorActivity,
    }
  }

  get eventListeners() {
    return this.keyMap
  }

  cursorActivity = (cm) => {
    if (!this.enabled) return

    const {decoDoc: {id: filename}} = this

    const selections = cm.listSelections()
    const selection = selections[0]

    if (selections.length === 1 && selection.empty()) {
      this.dispatch(batchActions([
        elementTreeActions.selectElementFromPos(filename, selection.from()),
        uiActions.setSidebarContext(),
      ]))
    }
  }

  changes = (cm, changes) => {
    const origin = changes[changes.length - 1].origin

    // Don't rebuild the elementTree when changing a prop - we do this manually.
    if (origin !== '+decoProp') {
      this.analyze(cm, changes)
    }
  }

  swapDoc = (cm) => {
    this.analyze(cm)
  }

  analyze = async (cm) => {
    if (!this.enabled) return

    const {decoDoc, decoDoc: {id: filename}} = this

    const raw = await FlowController.getAST(decoDoc.code, filename)
    const ast = JSON.parse(raw)
    const elementTree = ElementTreeBuilder.elementTreeFromAST(ast)

    this.dispatch(batchActions([
      astActions.setAST(filename, ast),
      elementTreeActions.setElementTree(filename, elementTree),
    ]))
  }

  attach(decoDoc) {
    if (!decoDoc) {
      return
    }

    this.decoDoc = decoDoc
  }

  detach() {
    if (!this.decoDoc) {
      return
    }

    this.decoDoc = null
  }

}

const middleware = new ASTMiddleware()

export default (dispatch, enabled) => {
  middleware.setDispatchFunction(dispatch)
  middleware.enabled = enabled
  return middleware
}
