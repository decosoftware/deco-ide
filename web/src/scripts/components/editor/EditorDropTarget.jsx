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
import ReactDOM from 'react-dom'
import { DropTarget } from 'react-dnd'
import _ from 'lodash'

import Editor from './Editor'
import TextUtils from '../../utils/editor/TextUtils'

const target = {
  drop(props, monitor, component) {
    const linkedDoc = component.refs.editor.getCurrentDoc()
    TextUtils.ensureNewlineWithIndentation(linkedDoc)
    props.onImportItem(monitor.getItem(), linkedDoc.id)
    component.focus()
  },
  hover(props, monitor, component) {
    const {x, y} = monitor.getClientOffset()
    component.setState({
      offset: {
        left: x,
        top: y,
      },
    })
  }
}

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver(),
  }
}

const style = {
  flexDirection: 'column',
  flex: '1 1 auto',
  alignItems: 'stretch',
  display: 'flex',
}

class EditorDropTarget extends Component {

  state = {
    offset: null,
  }

  focus() {
    this.refs.editor.focus()
  }

  render() {
    const {isOver, connectDropTarget, decoDoc, middleware} = this.props
    const {offset} = this.state

    // Enhance any middleware that have a setHover method
    middleware.forEach((m) => m.setHover && m.setHover(isOver, offset))

    return connectDropTarget(
      <div style={style}>
        <Editor ref={'editor'} {...this.props} />
      </div>
    )
  }
}

export default DropTarget('COMPONENT', target, collect)(EditorDropTarget)
