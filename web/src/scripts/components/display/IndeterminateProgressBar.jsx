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

class IndeterminateProgressBar extends Component {
  _animateBar() {
    if (!this.props.animate) {
      return null
    }
    const barStyle = Object.assign({}, {
      paddingLeft: 4,
      paddingRight: 4,
      height: '100%',
      position: 'absolute',
      width: '250px',
      borderRadius: 200,
      left: -530,
      animation: 'progress-bar-slide 3s linear infinite',
    }, this.props.barStyle)

    return (
      <div style={barStyle}/>
    )
  }

  render() {
    const {style} = this.props
    return (
      <div style={style}>
        {this._animateBar()}
      </div>
    )
  }
}

IndeterminateProgressBar.defaultProps = {
  barStyle: {
    border: '1px solid white',
    backgroundColor: 'blue',
  }
}

export default IndeterminateProgressBar
