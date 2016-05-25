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
import ReactDOM from 'react-dom'
import Colr from 'colr'

import Menu from '../menu/Menu'
import ColorPicker from './ColorPicker'

class ColorInput extends Component {

  constructor(props) {
    super(props)

    this.state = {
      showMenu: false,
      menuPosition: {
        top: 0,
        left: 0
      }
    }

    this.componentWillUnmount = this.componentWillUnmount.bind(this)
    this.componentDidUpdate = this.componentDidUpdate.bind(this)
    this._calculatePosition = this._calculatePosition.bind(this)
    this.onClickMenuButton = this.onClickMenuButton.bind(this)

    this.setMenuVisibility = this.setMenuVisibility.bind(this)
    this.setMenuVisibility = _.throttle(this.setMenuVisibility, 200, {
      leading: true,
      trailing: false
    })

    this.onChange = this.onChange.bind(this)
  }

  setMenuVisibility(visible) {
    this.setState({
      showMenu: visible
    })
  }

  onClickMenuButton() {
    this.setMenuVisibility(! this.state.showMenu)
  }

  /* Event handling */

  onChange(value) {
    return this.props.onChange(value)
  }

  /* Positioning */

  _calculatePosition() {
    const positionRect = ReactDOM.findDOMNode(this.refs.position).getBoundingClientRect()
    const position = {
      y: positionRect.bottom,
      x: (positionRect.left + positionRect.right) / 2
    }
    return position
  }

  /* Lifecycle */

  componentDidUpdate(prevProps, prevState) {
    const position = this._calculatePosition()
    if (!_.isEqual(this.state.menuPosition, position)) {
      return this.setState({
        menuPosition: position
      })
    }
  }

  componentWillUnmount() {
    if (this._preventNextMenuButtonTimeout != null) {
      return window.clearTimeout(this._preventNextMenuButtonTimeout)
    }
  }

  /* Rendering */

  render() {
    const style = _.defaults(_.clone(this.props.style), {
      width: '32px',
      height: '21px',
      padding: '3px',
      display: 'inline-block',
      background: 'white',
      borderRadius: '2px',
      boxShadow: '0 0 1px 0px rgba(0,0,0,0.4)',
      cursor: 'pointer',
    })
    const colorBoxInnerStyle = {
      height: '15px',
      borderRadius: '2px',
      position: 'relative'
    }
    const colorStyle = {
      background: this.props.value,
      position: 'absolute',
      top: '0',
      bottom: '0',
      left: '0',
      right: '0',
      borderRadius: '2px',
      boxShadow: '0 0 1px 1px rgba(0,0,0,0.3) inset'
    }

    return (
      <span ref={'position'}
        style={style}
        onClick={this.onClickMenuButton}
        onContextMenu={this.props.onContextMenu}>
        <div style={colorBoxInnerStyle}>
          <div className='transparency-checkers' />
          <div style={colorStyle} />
        </div>
        <Menu show={this.state.showMenu}
          caret={true}
          requestClose={this.setMenuVisibility.bind(null, false)}
          anchorPosition={this.state.menuPosition}>
          {
            this.state.showMenu && (
              <ColorPicker value={this.props.value}
                onChange={this.props.onChange} />
            )
          }
        </Menu>
      </span>
    )
  }

}

ColorInput.propTypes = {
  onChange: React.PropTypes.func.isRequired,
  value: React.PropTypes.string.isRequired,
}

ColorInput.defaultProps = {
  className: '',
  style: {},
}

export default ColorInput
