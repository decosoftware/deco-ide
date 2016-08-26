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

const FlowController = Electron.remote.require('./process/flowController.js')
import Middleware from '../Middleware'
import CodeMirrorEventTypes from '../../constants/CodeMirrorEventTypes'
import Pos from '../../models/editor/CodeMirrorPos'

let completionActive = false

/**
 * Middleware for showing autocompletions while typing
 */
class AutocompleteMiddleware extends Middleware {

  constructor() {
    super()

    this._keyMap = {
      [CodeMirrorEventTypes.changes]: this._changes.bind(this),
    }
  }

  get eventListeners() {
    return this._keyMap
  }

  showHint(pos, wordToComplete) {
    const {_filename: filename, _decoDoc: decoDoc} = this

    FlowController.startServer()

    return FlowController.getCompletion(decoDoc.code, pos, filename)
      .then(completion => {

        // Create completion list, filtering irrelevant completions
        const list = completion.result
          .map(item => item.name)
          .filter(item => item.startsWith(wordToComplete))

        return {
          list,
          from: new Pos(pos.line, pos.ch - wordToComplete.length),
          to: pos,
        }
      })
      .catch(e => console.log('Autocomplete error', e))
  }

  _changes(cm, changes) {

    // Do nothing if popup is already open
    if (completionActive) {
      return
    }

    // Only show popup if the last change was a user input event
    // http://stackoverflow.com/questions/26174164/auto-complete-with-codemirrror
    const origin = changes[changes.length - 1].origin
    if (! (origin === '+input' || origin === '+delete')) {
      return
    }

    const range = cm.listSelections()[0]
    const from = range.from()

    if (range.empty()) {
      const textBefore = cm.getRange(new Pos(from.line, 0), from)

      // Show popup if the user has typed at least 1 characters
      const match = textBefore.match(/[\w$]{1,}$/)

      if (match) {
        cm.showHint({
          completeSingle: false,
          shown: () => completionActive = true,
          close: () => completionActive = false,
          hint: () => this.showHint(from, match[0]),
        })
      }
    }
  }

  attach(decoDoc, filename) {
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

const middleware = new AutocompleteMiddleware()

export default (dispatch, filename) => {
  middleware._filename = filename
  middleware.setDispatchFunction(dispatch)
  return middleware
}
