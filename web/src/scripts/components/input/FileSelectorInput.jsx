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

import SimpleButton from '../buttons/SimpleButton'

import { STYLES } from '../../constants/InputConstants'

const baseStyle = Object.assign({}, STYLES.INPUT, {
  display: 'flex',
  flex: '1 0 0px',
  marginRight: 5,
})

const defaultStyle = {
  display: 'flex',
  justifyContent: 'center',
  color: "rgb(58,58,58)",
  backgroundColor: "#ffffff",
  border: '1px solid ' + "rgba(163,163,163,0.52)",
  borderRadius: '3px',
  textDecoration: 'none',
  padding: '0 8px',
  height: '20px',
  fontSize: 11,
  fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
  cursor: 'default',
  flex: '0 0 75px',
  fontWeight: '400',
}

const activeStyle = {
  ...defaultStyle,
  backgroundColor: "rgba(234,233,234,0.5)"
}

const hoverStyle = {
  ...defaultStyle,
  backgroundColor: "rgba(234,233,234, 1)",
}

const innerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

class FileSelectorInput extends Component {

  constructor(props) {
    super(props)
    this.state = {
      focused: false,
    }
  }

  onBlur() {
    this.setState({
      focused: false,
    })
  }

  onFocus() {
    this.setState({
      focused: true,
    })
  }

  render() {
    let style = baseStyle
    if (this.props.width) {
      style = Object.assign({}, baseStyle, {
        width: this.props.width,
      })
    } else {
      style = Object.assign({}, baseStyle, {
        width: 0,
      })
    }

    const alignStyle = {
      justifyContent: this.props.align || 'center',
    }

    const styles = {
      active: {...activeStyle,  ...alignStyle},
      hover:  {...hoverStyle,   ...alignStyle},
      def:    {...defaultStyle, ...alignStyle},
    }

    if (this.state.focused) {
      style = {
        ...style,
        border: '1px solid #017cfe',
      }
    }

    return (
      <div style={{display: 'flex', flex: '1 0 0px'}}>
        <input ref="input"
          readOnly={true}
          type="text"
          style={style}
          value={this.props.value}
          placeholder={this.props.placeholder}
          onFocus={this.onFocus.bind(this)}
          onBlur={this.onBlur.bind(this)}
          />
          <SimpleButton
            onClick={this.props.onSelectFile}
            defaultStyle={styles.def}
            activeStyle={styles.active}
            hoverStyle={styles.hover}
            innerStyle={innerStyle}>
          {this.props.buttonText || 'Browse...'}
        </SimpleButton>
      </div>
    )
  }

}

FileSelectorInput.propTypes = {
  onSelectFile: React.PropTypes.func.isRequired,
  value: React.PropTypes.string.isRequired,
  placeholder: React.PropTypes.string,
  buttonText: React.PropTypes.string,
}

FileSelectorInput.defaultProps = {
  className: '',
  style: {},
  onSelectFile: () => {},
}

export default FileSelectorInput
