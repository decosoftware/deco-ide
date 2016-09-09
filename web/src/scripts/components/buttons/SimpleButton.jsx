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
import React, { Component, PropTypes, } from 'react'

const OMIT_PROPS = ['defaultStyle', 'activeStyle', 'hoverStyle', 'innerStyle']

class SimpleButton extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isMouseDown: false,
      isMouseOver: false,
      styleSelector: 'defaultStyle',
    }
    this._bindMouseEvent('_onMouseDown', 'onMouseDown', {
      isMouseDown: true,
      styleSelector: 'activeStyle',
    })
    this._bindMouseEvent('_onMouseUp', 'onMouseUp', {
      isMouseDown: false,
      styleSelector: 'defaultStyle',
    })
    this._bindMouseEvent('_onMouseEnter', 'onMouseEnter', {
      isMouseOver: true,
      styleSelector: 'hoverStyle',
    })
    this._bindMouseEvent('_onMouseLeave', 'onMouseLeave', {
      isMouseOver: false,
      styleSelector: 'defaultStyle',
    })
  }

  _bindMouseEvent(fnName, propName, newState) {
    this[fnName] = (e) => {
      this.setState(newState)
      if (this.props[propName]) {
        this.props[propName](e)
      }
    }
  }

  render() {
    const buttonStyle = this.props[this.state.styleSelector]

    const props = _.omitBy(this.props, (v, k) => OMIT_PROPS.includes(k))

    return (
      <div {...props}
        style={buttonStyle}
        onMouseDown={this._onMouseDown}
        onMouseUp={this._onMouseUp}
        onMouseEnter={this._onMouseEnter}
        onMouseLeave={this._onMouseLeave}>
        <div style={this.props.innerStyle}>
          {this.props.children}
        </div>
      </div>
    )
  }


}

SimpleButton.propTypes = {
  defaultStyle: PropTypes.object.isRequired,
  activeStyle: PropTypes.object.isRequired,
  hoverStyle: PropTypes.object.isRequired,
  innerStyle: PropTypes.object.isRequired,
}

export default SimpleButton
