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
import Enum from '../../utils/Enum'

const containerStyle = {
  display: 'flex',
  flex: '1 0 auto',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
}

const containerStyleDark = Object.assign({}, containerStyle, {
  backgroundColor: 'rgb(35,36,38)',
})

const style = {
  fontSize: 14,
  fontWeight: 'bold',
  color: 'rgba(0,0,0,0.2)',
  paddingBottom: 20,
  textAlign: 'center',
}

const styleDark = Object.assign({}, style, {
  color: 'rgba(255,255,255,0.15)',
  textShadow: '0 1px 0 rgba(0,0,0,0.2)'
})

const THEME = Enum(
  'LIGHT',
  'DARK',
)

class NoContent extends Component {
  render() {
    const themedStyle = this.props.theme === THEME.LIGHT ?
        style : styleDark
    const themedContainerStyle = this.props.theme === THEME.LIGHT ?
        containerStyle : containerStyleDark

    return (
      <div style={themedContainerStyle}>
        <div style={themedStyle}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

NoContent.defaultProps = {
  theme: THEME.LIGHT,
}

NoContent.THEME = THEME

export default NoContent
