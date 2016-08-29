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

import SimpleButton from '../buttons/SimpleButton'

const baseStyle = {
  width: '100%',
  paddingTop: 4,
  paddingBottom: 4,
  paddingLeft: 10,
  paddingRight: 10,
  position: 'relative',
  color: 'white',
  cursor: 'default',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
}

const textStyle = {
  whiteSpace: 'pre-wrap',
  WebkitUserSelect: 'text',
  fontSize: 14,
  WebkitFontSmoothing: 'antialiased',
}

const closeStyle = {
  position: 'absolute',
  right: 0,
  top: 0,
  width: 30,
  height: 31,
  display: 'flex',
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
}

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

const baseButtonStyle = {
  backgroundColor: 'white',
  borderRadius: 3,
  padding: '2px 10px',
  fontSize: 13,
  fontWeight: 'bold',
  WebkitFontSmoothing: 'antialiased',
  marginTop: 6,
  marginBottom: 6,
  boxShadow: '0 2px 2px rgba(0,0,0,0.2)',
}

class EditorToast extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  render() {
    const {type, message, onClose, onButtonClick, buttonText} = this.props
    const closeTextStyle = this.state.hover ?
        {...closeTextDefaultStyle, ...closeTextVisibleStyle} :
        closeTextDefaultStyle

    const style = {
      ...baseStyle,
      backgroundColor: type === 'error' ? 'rgb(180,58,60)' : 'green',
    }

    const buttonStyle = {
      ...baseButtonStyle,
      color: type === 'error' ? 'rgb(180,58,60)' : 'green',
    }

    return (
      <div style={style}
        onMouseEnter={() => this.setState({hover: true})}
        onMouseLeave={() => this.setState({hover: false})}
      >
        <div style={textStyle}>
          {message}
        </div>
        <div style={closeStyle}>
          <SimpleButton
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            defaultStyle={closeTextStyle}
            activeStyle={{
              ...closeTextStyle,
              ...closeTextActiveStyle,
            }}
            hoverStyle={{
              ...closeTextStyle,
              ...closeTextHoverStyle,
            }}
            innerStyle={{}}>
            ×
          </SimpleButton>
        </div>
        {buttonText && (
          <SimpleButton
            onClick={(e) => {
              e.stopPropagation()
              onButtonClick()
            }}
            defaultStyle={buttonStyle}
            activeStyle={{...buttonStyle, opacity: 0.9}}
            hoverStyle={{...buttonStyle, opacity: 0.8}}
            innerStyle={{}}
          >
            {buttonText}
          </SimpleButton>
        )}
      </div>
    )
  }
}

export default EditorToast
