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
import React, { Component, PropTypes } from 'react'

class MenuItem extends Component {
  render() {
    let style = this.props.style
    if (this.props.active) {
      style = _.extend({}, style, this.props.hoverStyle)
    }
    return (
      <div className={this.props.className}
        ref='div'
        style={style}
        title={this.props.title}
        onClick={this.props.onClick}>
        {this.props.item}
        {this.props.name}
      </div>
    )
  }
}

MenuItem.propTypes = {
  name: PropTypes.string.isRequired,
}

MenuItem.defaultProps = {
  style: {
    minWidth: '100px',
    lineHeight: '30px',
    height: '30px',
    fontSize: 11,
    padding: '0 20px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  hoverStyle: {
    background: '#4A90E2',
    color: 'white',
  },
  title: '',
  onClick: () => {},
  image: null,
}

export default MenuItem
