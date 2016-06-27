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

import React, { Component, PropTypes } from 'react'

import SimpleButton from './SimpleButton'

const style = {
  width: '100%',
  height: 31,
  backgroundColor: 'rgb(27,28,29)',
  borderRight: '1px solid rgb(16,16,16)',
  position: 'relative',
  color: 'rgba(255,255,255,0.3)',
  cursor: 'default',
}

const focusedStyle = Object.assign({}, style, {
  backgroundColor: 'rgb(35,36,38)',
  color: 'rgba(255,255,255,0.7)',
  boxShadow: '0 1px rgb(35,36,38), 2px 0 rgb(22,128,250) inset',
})

const textStyle = {
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  textAlign: 'center',
  padding: '0 10px',
  whiteSpace: 'nowrap',
}

const closeStyle = {
  width: 20,
  height: 31,
  position: 'absolute',
  right: 0,
  top: 0,
  paddingLeft: 2,
  backgroundColor: 'rgb(27,28,29)',
  boxShadow: '-4px 0 4px rgb(27,28,29)',
}

const focusedCloseStyle = Object.assign({}, closeStyle, {
  backgroundColor: 'rgb(35,36,38)',
  boxShadow: '-4px 0 4px rgb(35,36,38)',
})

const closeTextDefaultStyle = {
  opacity: 0,
  transition: 'opacity 0.2s',
}

const closeTextVisibleStyle = {
  opacity: 1,
}

const closeTextHoverStyle = {
  opacity: 0.5,
}

const closeTextActiveStyle = {
  opacity: 0.75,
}

class Tab extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const focused = this.props.focused
    const closeTextStyle = this.state.hover ?
        Object.assign({}, closeTextDefaultStyle, closeTextVisibleStyle) :
        closeTextDefaultStyle
    return (
      <div style={focused ? focusedStyle : style}
        title={this.props.title}
        onMouseEnter={() => this.setState({hover: true})}
        onMouseLeave={() => this.setState({hover: false})}
        onClick={this.props.onFocus}>
        <div style={textStyle}>
          {this.props.children}
        </div>
        <div style={focused ? focusedCloseStyle : closeStyle}>
          <SimpleButton
            onClick={(e) => {
              e.stopPropagation()
              this.props.onClose()
            }}
            defaultStyle={closeTextStyle}
            activeStyle={Object.assign({}, closeTextStyle, closeTextActiveStyle)}
            hoverStyle={Object.assign({}, closeTextStyle, closeTextHoverStyle)}
            innerStyle={{}}>
            ×
          </SimpleButton>
        </div>
      </div>
    )
  }
}

export default Tab
