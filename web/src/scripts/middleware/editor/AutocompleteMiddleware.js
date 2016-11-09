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
import { EventTypes } from '../../constants/CodeMirrorTypes'
import Pos from '../../models/editor/CodeMirrorPos'
import { AutocompleteHint } from '../../components'
import * as ChangeUtils from '../../utils/Editor/ChangeUtils'

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
export default class AutocompleteMiddleware extends Middleware {

  constructor() {
    super()

    this.completionActive = false
    this.currentWord = ''

    // In order to keep completions from spontaneously disappearing as we type,
    // we cache the previous completion shown. We continue to show it as we
    // wait for a new set of completions, updating the highlighted portion of
    // the hints immediately.
    this.cachedCompletions = {}

    this.eventListeners = {
      [EventTypes.changes]: this.changes,
    }
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

  // If base = initialString
  // strToCheck = ini returns true
  // strToCheck = iNtsr returns true
  // strToCheck = initsa returns false
  containsLettersInOrder(base, strToCheck) {
    // base = base.toLowerCase()
    // strToCheck = strToCheck.toLowerCase()
    let highestMatchedIndex = -1
    for (let i=0; i < strToCheck.length; i++) {
      const workingIndex = highestMatchedIndex + 1
      const index = base.substring(workingIndex).indexOf(strToCheck[i]) + workingIndex
      console.log("base", base)
      console.log("base.substring(workingIndex)", base.substring(workingIndex))
      console.log("strToCheck", strToCheck)
      console.log("strToCheck[i]", strToCheck[i])
      console.log("workingIndex", workingIndex)
      console.log("index", index)
      console.log("highestMatchedIndex", highestMatchedIndex)
      if (index <= highestMatchedIndex)
        return false
      highestMatchedIndex = index
    }
    return true
  }

  prepareHint(pos, wordToComplete, completion) {

    // Get basic completions from nearby text
    const cmDoc = this.decoDoc.cmDoc
    const basic = CodeMirror.hint.anyword(cmDoc).list.map(item => ({name: item}))

    // Join flow completions and basic completions
    const list = _.chain([...completion.result, ...basic])

      // Filter word being typed and irrelevant completions,
      // disregarding case
      .filter((item) => {
        return item.name !== wordToComplete &&
        this.containsLettersInOrder(item.name.toLowerCase(), wordToComplete.toLowerCase())
        // item.name.toLowerCase().startsWith(wordToComplete.toLowerCase())
      })

      // Remove duplicates
      .uniqBy('name')
      .sortBy('name')

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
    const {decoDoc} = this

    FlowController.startServer()

    return FlowController.getCompletion(decoDoc.code, pos, decoDoc.id)
      .then(completion => {
        this.cachedCompletions[decoDoc.id] = {wordToComplete, completion}
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

  changes = (cm, changes) => {
    const {decoDoc} = this

    // Only show popup in the linked doc in the active tab
    if (!cm.hasFocus()) return

    // Do nothing if popup is already open
    if (this.completionActive) return

    // Only show popup if the last change was a user input event
    if (!ChangeUtils.containsUserInputChange(changes)) return

    const range = cm.listSelections()[0]
    const from = range.from()

    if (range.empty()) {
      const textBefore = cm.getRange(new Pos(from.line, 0), from)

      // Show popup if the user has typed at least 1 characters
      const match = textBefore.match(/[\w$]{1,}$/)

      if (match) {
        const word = match[0]
        const cached = this.cachedCompletions[decoDoc.id]

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

}
