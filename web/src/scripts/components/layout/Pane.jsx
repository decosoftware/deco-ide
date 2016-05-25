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
import React, { Component, } from 'react'
import DragToChangeValue from '../input/DragToChangeValue'

const RESIZABLE_EDGE = _.mapKeys([
  'LEFT',
  'RIGHT',
  'TOP',
  'BOTTOM',
  'NONE',
])

class Pane extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const style = {
      width: this.props.size,
      height: '100%',
      position: 'relative',
      flexDirection: 'column',
      alignItems: 'stretch',
    }

    const draggableStyle = {
      zIndex: 1000,
      width: this.props.draggableSize,
      position: 'absolute',
      height: '100%',
      // backgroundColor: 'red',
      cursor: 'col-resize',
    }

    let axis = DragToChangeValue.AXIS.X

    if (this.props.resizableEdge === RESIZABLE_EDGE.TOP ||
        this.props.resizableEdge === RESIZABLE_EDGE.BOTTOM) {

      axis = DragToChangeValue.AXIS.Y

      Object.assign(style, {
        width: '100%',
        height: this.props.size,
      })

      Object.assign(draggableStyle, {
        width: '100%',
        height: this.props.draggableSize,
        cursor: 'row-resize',
      })
    }

    switch (this.props.resizableEdge) {
      case RESIZABLE_EDGE.LEFT:
        draggableStyle.left = 0
        draggableStyle.top = 0
      break
      case RESIZABLE_EDGE.RIGHT:
        draggableStyle.right = 0
        draggableStyle.top = 0
      break
      case RESIZABLE_EDGE.TOP:
        draggableStyle.left = 0
        draggableStyle.top = 0
      break
      case RESIZABLE_EDGE.BOTTOM:
        draggableStyle.left = 0
        draggableStyle.bottom = 0
      break
      default:
        draggableStyle.display = 'none'
      break
    }

    const reverse = this.props.resizableEdge === RESIZABLE_EDGE.LEFT ||
        this.props.resizableEdge === RESIZABLE_EDGE.TOP ? false : true

    return (
      <div className={this.props.className}
        style={style}>
        <DragToChangeValue
          style={draggableStyle}
          min={this.props.min}
          max={this.props.max}
          value={this.props.size}
          axis={axis}
          reverse={reverse}
          onChange={this.props.onResize} />
        <div style={this.props.style}>
          {this.props.children}
        </div>
      </div>
    )
  }

}

Pane.propTypes = {

}

Pane.defaultProps = {
  size: 200,
  draggableSize: 3,
  min: 100,
  max: 400,
  resizableEdge: RESIZABLE_EDGE.NONE,
}

Pane.RESIZABLE_EDGE = RESIZABLE_EDGE

export default Pane
