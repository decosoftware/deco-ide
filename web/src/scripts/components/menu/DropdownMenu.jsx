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
import { StylesEnhancer } from 'react-styles-provider'

const stylesCreator = (theme) => {
  const styles = {
    transparent: {
      borderRadius: '3px',
      boxShadow: '0 2px 8px 1px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,0,0,0.1)',
      padding: '10px 0',
    },
  }

  styles.main = {
    ...styles.transparent,
    background: 'rgb(252,251,252)',
  }

  return styles
}

@StylesEnhancer(stylesCreator)
export default class DropdownMenu extends Component {

  static defaultProps = {
    className: '',
    style: {},
  }
  
  render() {
    const {styles, style, captureBackground} = this.props

    return (
      <Menu
        {...this.props}
        style={{...(captureBackground ? styles.transparent : styles.main), ...style}}
      />
    )
  }
}
