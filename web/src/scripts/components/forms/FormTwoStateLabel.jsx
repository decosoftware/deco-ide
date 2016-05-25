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

import TwoStateButton from '../buttons/TwoStateButton'

const hoverStyle = {
  boxShadow: '0 0 1px rgba(0,0,0,0.5) inset',
}

const enabledStyle = {
  boxShadow: '0 0 2px rgba(0,0,0,0.5) inset',
  backgroundColor: 'rgba(0,0,0,0.05)',
}

const enabledHoverStyle = {
  backgroundColor: 'rgba(0,0,0,0.02)',
}

class FormTwoStateLabel extends Component {

  _calculatePosition() {
    const {left, right, width, height, bottom} = ReactDOM.findDOMNode(this.refs.position).getBoundingClientRect()
    return {
      y: bottom,
      x: (left + right) / 2,
      width: width,
      height: height,
    }
  }

  render() {
    let {
      label,
      labelWidth,
      disabled,
      onClick,
      onChange,
      onLabelPositionChange,
      enabled
    } = this.props

    let style = {
      color: 'rgb(73,73,73)',
      fontSize: 11,
      flex: labelWidth ? `0 0 ${labelWidth}px` : `1 1 auto`,
      letterSpacing: 0.3,
      paddingLeft: 5,
      cursor: 'default',
      height: '100%',
    }

    let innerStyle = {
      borderRadius: 4,
      paddingLeft: 5,
      paddingRight: 5,
      display: labelWidth && labelWidth < 36 ? 'none' : 'inline-block',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      height: '100%',
      lineHeight: '20px',
      marginTop: 5,
      height: 20,
      maxWidth: labelWidth ? labelWidth - 15 : 'auto',
    }

    if (disabled) {
      style = Object.assign({}, style, {
        color: 'rgb(170,170,170)',
      })
    }

    return (
      <div
        ref={'root'}
        style={style}
        title={label}>
        <TwoStateButton
          enabled={enabled}
          hoverStyle={hoverStyle}
          enabledStyle={enabledStyle}
          enabledHoverStyle={enabledHoverStyle}
          onChange={onChange}>
          <span ref={'position'}
            style={innerStyle}
            onClick={(e) => {
              onLabelPositionChange(this._calculatePosition())
              onClick(e)
            }}>
            {label}
          </span>
        </TwoStateButton>
      </div>
    )
  }
}

FormTwoStateLabel.defaultProps = {
  onClick: () => {},
  onChange: () => {},
  onLabelPositionChange: () => {},
}

export default FormTwoStateLabel
