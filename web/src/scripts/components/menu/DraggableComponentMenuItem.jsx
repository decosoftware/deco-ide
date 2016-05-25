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

import React, { Component, } from 'react'
import { DragSource } from 'react-dnd'
import _ from 'lodash'

import ComponentMenuItem from './ComponentMenuItem'

/**
 * Implements the drag source contract.
 */
const source = {
  beginDrag(props) {
    return props.item
  }
}

/**
 * Specifies the props to inject into your component.
 */
function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    connectDragPreview: connect.dragPreview(),
    isDragging: monitor.isDragging(),
  }
}

const overlayStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(255,255,255,0.85)',
}

class DraggableComponentMenuItem extends Component {
  constructor(props) {
    super(props)
    this.state = {
      clicked: false,
    }
  }
  handleClick() {
    this.clearTimer()

    this.setState({clicked: true})

    this._timerId = setTimeout(() => {
      this.setState({clicked: false})
    }, 2000)
  }
  clearTimer() {
    if (this._timerId) {
      clearTimeout(this._timerId)
      this._timerId = null
    }
  }
  componentDidMount() {
    const img = new Image()
    img.src = `./images/component-drag-layer.png`
    img.onload = () => this.props.connectDragPreview(img)
  }
  componentWillUnmount() {
    this.clearTimer()
  }
  render() {
    const { isDragging, connectDragSource } = this.props
    const { clicked } = this.state
    const style = {
      opacity: isDragging ? 0.5 : 1,
      position: 'relative',
    }
    return connectDragSource(
      <div style={style}
        titile={'Drag me into your code!'}
        onClick={this.handleClick.bind(this)}>
          <ComponentMenuItem {...this.props} />
          {
            clicked && <div style={overlayStyle}>
              <div>Drag me into your code!</div>
              <div>Or use <b>cmd+i</b> to insert while typing</div>
            </div>
          }
      </div>,
      { dropEffect: 'copy' }
    )
  }
}

export default DragSource('COMPONENT', source, collect)(DraggableComponentMenuItem);
