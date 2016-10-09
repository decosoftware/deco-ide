/**
 *    Copyright (C) 2015 Deco Software Inc.
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Affero General Public License, version 3,
 *    as published by the Free Software Foundation.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import React, { Component } from 'react'
import { StylesEnhancer } from 'react-styles-provider'
import 'codemirror/addon/runmode/runmode'
import CodeMirror from 'codemirror'

const CH_WIDTH = 1
const CH_HEIGHT = 2
const LINE_HEIGHT = 3

// TODO handle multiple text editor themes
const COLORS = {
  ['normal']: 'rgba(233, 237, 237, 1)',
  ['selected']: '#FFFFFF',

  // Types
  ['keyword']: 'rgba(199, 146, 234, 1)',
  ['operator']: 'rgba(233, 237, 237, 1)',
  ['variable-2']: '#80CBC4',
  ['variable-3']: '#82B1FF',
  ['builtin']: '#DECB6B',
  ['atom']: '#F77669',
  ['number']: '#F77669',
  ['def']: 'rgba(233, 237, 237, 1)',
  ['string']: '#C3E88D',
  ['string-2']: '#80CBC4',
  ['comment']: '#546E7A',
  ['variable']: '#82B1FF',
  ['tag']: '#80CBC4',
  ['meta']: '#80CBC4',
  ['attribute']: '#FFCB6B',
  ['property']: '#80CBAE',
  ['qualifier']: '#DECB6B',
  ['variable-3']: '#DECB6B',
  ['tag']: 'rgba(255, 83, 112, 1)',
  ['error']: 'rgba(255, 255, 255, 1)',
}

const stylesCreator = (theme) => ({
  container: {
    flex: '1 1 auto',
    display: 'flex',
    alignItems: 'stretch',
    position: 'relative',
    overflow: 'hidden',
  },
  canvas: {
    flex: '1 1 auto',
    opacity: 0.6,
  },
})

@StylesEnhancer(stylesCreator)
export default class Minimap extends Component {

  static defaultProps = {
    onScrollToLine: () => {},
  }

  componentDidMount() {
    this.updateCanvas()
  }

  componentDidUpdate() {
    this.updateCanvas()
  }

  onMoveViewport = (e) => {
    const {canvas} = this.refs
    const {top} = canvas.getBoundingClientRect()
    const y = e.clientY - top
    const line = Math.floor(y / LINE_HEIGHT)

    this.props.onScrollToLine(line)
  }

  attachGlobalListeners() {
    document.addEventListener('mousemove', this.onMouseMove)
    document.addEventListener('mouseup', this.onMouseUp)
  }

  detachGlobalListeners() {
    document.removeEventListener('mousemove', this.onMouseMove)
    document.removeEventListener('mouseup', this.onMouseUp)
  }

  onMouseDown = (e) => {
    e.stopPropagation()
    e.preventDefault()

    this.onMoveViewport(e)
    this.attachGlobalListeners()
  }

  onMouseMove = (e) => {
    e.stopPropagation()
    e.preventDefault()

    this.onMoveViewport(e)
  }

  onMouseUp = (e) => {
    e.stopPropagation()
    e.preventDefault()

    this.detachGlobalListeners()
  }

  updateCanvas() {
    const {text, width, height} = this.props
    const {canvas} = this.refs

    if (!text) return

    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, width, height)

    CodeMirror.runMode(text, 'jsx', (value, style, line, ch, state) => {

      // Reject anything without at least one non-whitespace character
      if (!value.match(/\S/)) return

      ctx.fillStyle = COLORS[style] || COLORS.normal
      ctx.fillRect(ch * CH_WIDTH, line * LINE_HEIGHT, value.length * CH_WIDTH, CH_HEIGHT)
    })
  }

  render() {
    const {styles, width, height} = this.props

    return (
      <div
        style={styles.container}
        onMouseDown={this.onMouseDown}
      >
        <canvas
          ref={'canvas'}
          width={width}
          height={height}
          style={styles.canvas}
        />
      </div>
    )
  }
}
