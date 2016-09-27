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
import * as ChangeUtils from '../../utils/Editor/ChangeUtils'

/**
 * Middleware for building an AST from the file
 */
export default class ASTMiddleware extends Middleware {

  constructor() {
    super()

    this.eventListeners = {
      [EventTypes.changes]: this.changes,
      [EventTypes.swapDoc]: this.swapDoc,
      [EventTypes.cursorActivity]: this.cursorActivity,
    }
  }

  cursorActivity = (cm) => {
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

    // TODO:
    // Only rebuild the elementTree for the linked doc in the active tab,
    // or perhaps instead when the AST is stale.
    // Currently this breaks when adding/removing props, since these affect the AST,
    // so we rebuild even if the doc is open in multiple tabs.
    // if (!cm.hasFocus()) return

    // Don't rebuild the elementTree when changing a prop - we do this manually.
    if (ChangeUtils.containsDecoPropChange(changes)) return

    this.analyze(cm, changes)
  }

  swapDoc = (cm) => {
    this.analyze(cm)
  }

  analyze = async (cm) => {
    const {decoDoc, decoDoc: {id: filename}} = this

    // TODO Figure out why calling getAST slows typing significantly.
    const raw = await FlowController.getAST(decoDoc.code, filename)

    const ast = JSON.parse(raw)
    const elementTree = ElementTreeBuilder.elementTreeFromAST(ast)

    this.dispatch(batchActions([
      astActions.setAST(filename, ast),
      elementTreeActions.setElementTree(filename, elementTree),
    ]))
  }

}
