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
import React, { Component } from 'react'

import Menu from './Menu'

class DropdownMenu extends Component {
  render() {
    let style = {
      background: 'rgb(252,251,252)',
      borderRadius: '3px',
      boxShadow: '0 2px 8px 1px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.1)',
      padding: '10px 0',
    }
    style = _.extend(style, _.cloneDeep(this.props.style))
    return (
      <Menu {...this.props} style={style}/>
    )
  }
}

DropdownMenu.defaultProps = {
  className: '',
  style: {},
}

export default DropdownMenu
