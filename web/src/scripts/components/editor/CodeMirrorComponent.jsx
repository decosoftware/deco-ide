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

'use strict'

import React, { Component, PropTypes, } from 'react'
import _ from 'lodash'
import CodeMirror from 'codemirror'
import TextUtils from '../../utils/editor/TextUtils'
import ThemeUtils from '../../utils/editor/ThemeUtils'
import StyleNode from '../../utils/StyleNode'

CodeMirror.commands.indentMore = TextUtils.indent.bind(TextUtils)

import 'codemirror/mode/jsx/jsx'
import 'codemirror/keymap/vim'
import 'codemirror/addon/fold/xml-fold'
import 'codemirror/addon/edit/matchtags'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/addon/edit/closetag'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/search/searchcursor'
import 'codemirror/addon/search/search'
import 'codemirror/addon/dialog/dialog'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/comment/comment'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/anyword-hint'
import 'codemirror/addon/selection/active-line'
import 'codemirror/keymap/sublime'
import '../../utils/decoParserMode'
import '../../utils/editor/ShowInvisiblesPlugin'

export default class CodeMirrorComponent extends Component {

  static propTypes = {
    value: PropTypes.any,
  }

  static defaultProps = {
    options: {},
    doc: new CodeMirror.Doc('', 'jsx'),
    style: {},
  }

  constructor() {
    super()

    this.styleNode = new StyleNode()
  }

  _attachEventListeners(cm, listeners) {
    _.each(listeners, (listener) => {
      _.each(listener, (fn, eventName) => {
        cm.on(eventName, fn)
      })
    })
  }

  _detachEventListeners(cm, listeners) {
    _.each(listeners, (listener) => {
      _.each(listener, (fn, eventName) => {
        cm.off(eventName, fn)
      })
    })
  }

  _setDefaultOptions(options) {
    return _.defaults(_.clone(options), {
      mode: 'javascript',
      theme: 'deco', // pref
      indentUnit: 2,
      height: '100%',
      lineNumbers: true,
      value: this.props.doc,
      dragDrop: false,
      matchTags: {
        bothTags: true,
      },
      matchBrackets: true,
      autoCloseTags: true,
      autoCloseBrackets: true,
      addModeClass: true,
      keyMap: 'sublime', // pref
      showInvisibles: true, // pref
      styleActiveLine: true, // pref
      showIndentGuides: true, // pref
      showCursorWhenSelecting: true,
      lineWiseCopyCut: true,
      hint: CodeMirror.hint.anyword,
      extraKeys: {
        'Tab': 'indentMore',
        'Ctrl-Space': 'autocomplete',
        'Cmd-/': () => {
          _.each(this.codeMirror.listSelections(), (selection) => {
            const mode = this.codeMirror.getModeAt(selection.from())
            switch (mode.name) {
              case 'xml':
                return this.codeMirror.toggleComment({
                  lineComment: '//',
                })
              case 'javascript':
                return this.codeMirror.toggleComment({
                  lineComment: '//',
                })
            }
          })
        },
      },
    })
  }

  _instantiateCodeMirror(options) {
    const fullOptions = this._setDefaultOptions(options)
    this.codeMirror = CodeMirror.fromTextArea(this.refs.codemirror, fullOptions)
  }

  _destroyCodeMirror() {
    this.codeMirror.swapDoc(new CodeMirror.Doc(''))
    this.codeMirror.toTextArea()
    this.codeMirror = null
  }

  //LIFECYCLE METHODS

  attachStyles(options) {
    const {fontSize} = options

    this.styleNode.setText(`
      .CodeMirror {
        font-size: ${fontSize}px !important;
      }
    `)
    this.styleNode.attach()
  }

  detachStyles() {
    this.styleNode.detach()
  }

  componentDidMount() {
    this.attachStyles(this.props.options)
    this._instantiateCodeMirror(this.props.options)
    this._attachEventListeners(this.codeMirror, this.props.eventListeners)

    if (this.props.doc) {
      if (this.props.doc != this.codeMirror.getDoc()) {
        this.codeMirror.swapDoc(this.props.doc)
      }
    } else {
      console.error('CodeMirrorComponent instantiated without doc')
    }
  }

  componentWillReceiveProps(nextProps) {
    this._detachEventListeners(this.codeMirror, this.props.eventListeners)

    if (! _.isEqual(nextProps.options, this.props.options)) {
      _.each(nextProps.options, (value, option) => {
        this.codeMirror && this.codeMirror.setOption(option, value)
      })
      this.detachStyles()
      this.attachStyles(nextProps.options)
    }

    this._attachEventListeners(this.codeMirror, nextProps.eventListeners)

    if (nextProps.doc && this.codeMirror) {
      if (nextProps.doc != this.codeMirror.getDoc()) {
        this.codeMirror.swapDoc(nextProps.doc)
      }
    }
  }

  componentWillUnmount() {
    this.detachStyles()

    if (this.codeMirror) {
      this._detachEventListeners(this.codeMirror, this.props.eventListeners)

      // For hot reload, swap in a blank doc
      this.codeMirror.swapDoc(new CodeMirror.Doc(''))

      this.codeMirror.toTextArea()
    }
  }

  render() {
    const {style, className} = this.props

    return (
      <div style={style} className={className}>
        <textarea
          ref={'codemirror'}
          autoComplete={'off'}
          defaultValue={''}
        />
      </div>
    )
  }
}
