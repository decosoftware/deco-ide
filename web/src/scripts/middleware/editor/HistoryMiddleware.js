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
import { batchActions } from 'redux-batched-subscribe'

import * as URIUtils from '../../utils/URIUtils'
import * as editorActions from '../../actions/editorActions'
import * as textEditorCompositeActions from '../../actions/textEditorCompositeActions'
import { markUnsaved } from '../../actions/fileActions'
import { tabActions } from '../../actions'
import { CONTENT_PANES } from '../../constants/LayoutConstants'
import Middleware from '../Middleware'
import { EventTypes } from '../../constants/CodeMirrorTypes'
import DecoChangeFactory from '../../factories/editor/DecoChangeFactory'
import CodeMirrorChange from '../../models/editor/CodeMirrorChange'

/**
 * Middleware for custom history management
 */
export default class HistoryMiddleware extends Middleware {

  constructor() {
    super()

    this.eventListeners = {
      [EventTypes.beforeChange]: this.onBeforeChange,
      [EventTypes.changes]: this.onChanges,
    }
  }

  attach(decoDoc, linkedDoc) {
    super.attach(decoDoc, linkedDoc)

    this.changeId = null
    this.oldCommands = {
      undo: CodeMirror.commands.undo,
      redo: CodeMirror.commands.redo,
    }

    CodeMirror.commands.undo = this.undo
    CodeMirror.commands.redo = this.redo
  }

  detach() {
    if (!this.decoDoc) return

    super.detach()

    CodeMirror.commands.undo = this.oldCommands.undo
    CodeMirror.commands.redo = this.oldCommands.redo

    this.changeId = null
    this.oldCommands = null
  }

  undo = () => {
    this.dispatch(textEditorCompositeActions.undo(this.decoDoc.id))
  }

  redo = () => {
    this.dispatch(textEditorCompositeActions.redo(this.decoDoc.id))
  }

  // A batched version of onChange, for performance
  onChanges = () => {
    if (this.decoDoc.isClean() || !this.changeId) {
      const {id} = this.decoDoc

      this.changeId = this.decoDoc.changeGeneration()

      this.dispatch(batchActions([
        markUnsaved(id),
        editorActions.markDirty(id),
        tabActions.makeTabPermanent(CONTENT_PANES.CENTER, URIUtils.filePathToURI(id)),
      ]))
    }
  }

  onBeforeChange = (cm, change) => {
    if (!this.decoDoc.locked) {
      change.cancel()

      const cmChange = new CodeMirrorChange(
        change.from,
        change.to,
        change.text,
        cm.getRange(change.from, change.to),
        change.origin
      )

      const decoChange = DecoChangeFactory.createChangeFromCMChange(cmChange)
      this.dispatch(textEditorCompositeActions.edit(this.decoDoc.id, decoChange))

      return
    }
  }

}
