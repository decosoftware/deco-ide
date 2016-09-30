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
import pureRender from 'pure-render-decorator'

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

@pureRender
class DraggableComponentMenuItem extends Component {

  componentDidMount() {
    const img = new Image()
    img.src = `./images/component-drag-layer.png`
    img.onload = () => this.props.connectDragPreview(img)
  }

  render() {
    const { isDragging, connectDragSource } = this.props
    const style = {
      opacity: isDragging ? 0.5 : 1,
      position: 'relative',
    }
    return connectDragSource(
      <div
        style={style}
        title={'Drag me into your code!'}
      >
        <ComponentMenuItem {...this.props} />
      </div>,
      { dropEffect: 'copy' }
    )
  }
}

export default DragSource('COMPONENT', source, collect)(DraggableComponentMenuItem);
