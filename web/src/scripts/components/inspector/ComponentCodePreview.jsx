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
import React, { Component } from 'react'
import { StylesEnhancer } from 'react-styles-provider'
import pureRender from 'pure-render-decorator'
import CodeMirror from 'codemirror'

import * as TemplateFactory from '../../factories/module/TemplateFactory'
import CodeMirrorComponent from '../editor/CodeMirrorComponent'

const stylesCreator = ({colors}) => ({
  container: {
    flex: '0 0 200px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    position: 'relative',
    minWidth: 0,
    minHeight: 0,
    height: 200,
  },
  editor: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    border: `1px solid ${colors.editor.divider}`
  }
})

@StylesEnhancer(stylesCreator)
@pureRender
export default class ComponentCodePreview extends Component {

  editorOptions = {
    readOnly: 'nocursor',
    lineNumbers: false,
    showInvisibles: false,
    showIndentGuides: false,
    styleActiveLine: false,
  }

  constructor() {
    super()
    this.doc = new CodeMirror.Doc('', 'jsx')
  }

  componentDidMount() {
    this.doc.setValue(this.buildCode())
  }

  componentDidUpdate() {
    this.doc.setValue(this.buildCode())
  }

  // Indent and wrap with parentheses for better syntax highlighting
  wrapComponentCode(code) {
    return '(\n' +
      code
        .split('\n')
        .map(line => `  ${line}`)
        .join('\n') +
    '\n)'
  }

  buildCode() {
    const {component} = this.props
    const {tagName, props, dependencies, imports} = component

    const chunks = [
      imports.map(TemplateFactory.renderImportsCode).join('\n'),
      this.wrapComponentCode(TemplateFactory.createJSX({tagName, props})),
    ].filter(x => x)

    return chunks.join('\n\n')
  }

  render() {
    const {styles} = this.props

    return (
      <div style={styles.container}>
        <CodeMirrorComponent
          style={styles.editor}
          doc={this.doc}
          options={this.editorOptions}
        />
      </div>
    )
  }
}
