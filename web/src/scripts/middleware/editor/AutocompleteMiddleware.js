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
import React from 'react'
import ReactDOM from 'react-dom'
import CodeMirror from 'codemirror'

const FlowController = Electron.remote.require('./process/flowController.js')
import Middleware from '../Middleware'
import CodeMirrorEventTypes from '../../constants/CodeMirrorEventTypes'
import Pos from '../../models/editor/CodeMirrorPos'
import { AutocompleteHint } from '../../components'

/**
 * Middleware for showing autocompletion hints while typing.
 *
 * We use a combination of 2 sources for hints:
 * - "basic" completions provided by CodeMirror's anyword plugin
 * - "flow" completions provided by a local flow-bin node_modules, if one exists
 *
 * If basic and flow both offer the same completion for a word, we show the flow
 * completion, since it will likely have detailed type information.
 *
 * In the case that flow doesn't exist, we show only basic completions.
 */
class AutocompleteMiddleware extends Middleware {

  constructor() {
    super()

    this.completionActive = false
    this.currentWord = ''

    // In order to keep completions from spontaneously disappearing as we type,
    // we cache the previous completion shown. We continue to show it as we
    // wait for a new set of completions, updating the highlighted portion of
    // the hints immediately.
    this.cachedCompletions = {}

    this._keyMap = {
      [CodeMirrorEventTypes.changes]: this._changes.bind(this),
    }
  }

  get eventListeners() {
    return this._keyMap
  }

  renderHint(item, wordToComplete, node) {
    const root = (
      <AutocompleteHint
        text={item.name}
        type={item.type}
        wordToComplete={wordToComplete}
        functionDetails={item.func_details}
      />
    )
    ReactDOM.render(root, node)
  }

  prepareHint(pos, wordToComplete, completion) {

    // Get basic completions from nearby text
    const cm = this._decoDoc.cmDoc
    const basic = CodeMirror.hint.anyword(cm).list.map(item => ({name: item}))

    // Join flow completions and basic completions
    const list = _.chain([...completion.result, ...basic])

      // Remove duplicates
      .uniqBy('name')
      .sortBy('name')

      // Filter irrelevant completions
      .filter(item => item.name.startsWith(wordToComplete))
      .map(item => {
        return {
          text: item.name,
          render: this.renderHint.bind(this, item, wordToComplete),
        }
      })
      .value()

    return {
      list,
      from: new Pos(pos.line, pos.ch - wordToComplete.length),
      to: pos,
    }
  }

  getHint(pos, wordToComplete) {
    const {_filename: filename, _decoDoc: decoDoc} = this

    FlowController.startServer()

    return FlowController.getCompletion(decoDoc.code, pos, filename)
      .then(completion => {
        this.cachedCompletions[filename] = {wordToComplete, completion}
        return this.prepareHint(pos, wordToComplete, completion)
      })

      // If Flow is unavailable, we still may show basic completions
      .catch(e => {
        return this.prepareHint(pos, wordToComplete, {result: []})
      })
  }

  showHint(cm, hint) {
    cm.showHint({
      completeSingle: false,
      shown: () => this.completionActive = true,
      close: () => this.completionActive = false,
      hint: () => hint,
    })
  }

  _changes(cm, changes) {

    // Do nothing if popup is already open
    if (this.completionActive) {
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
        const word = match[0]
        const cached = this.cachedCompletions[this._filename]

        this.currentWord = word

        // Show existing cached completion, but update highlighted portion
        if (cached && word.startsWith(cached.wordToComplete)) {
          this.showHint(cm, this.prepareHint(from, word, cached.completion))
        }

        // Fetch new completion
        this.getHint(from, word).then((hint) => {

          // Since this is async, make sure we're still completing the correct word
          if (word === this.currentWord) {
            this.showHint(cm, hint)
          }
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
