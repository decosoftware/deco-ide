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

import SimpleButton from './SimpleButton'

const defaultStyle = {
  display: 'flex',
  justifyContent: 'center',
  color: "#787676",
  backgroundColor: "#ffffff",
  border: '1px solid ' + "rgba(203,203,203,0.52)",
  borderRadius: '5px',
  textDecoration: 'none',
  padding: '0 8px',
  height: '34px',
  fontSize: 14,
  lineHeight: '34px',
  cursor: 'default',
  flex: '0 0 35px',
  fontWeight: '400',
}

const activeStyle = {
  ...defaultStyle,
  backgroundColor: "rgba(0,0,0,0.02)"
}

const hoverStyle = {
  ...defaultStyle,
  backgroundColor: "rgba(0,0,0,0.04)",
}

const innerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export default class LandingButton extends Component {
  render() {
    const alignStyle = {
      justifyContent: this.props.align || 'center',
    }

    const styles = {
      active: {...activeStyle,  ...alignStyle},
      hover:  {...hoverStyle,   ...alignStyle},
      def:    {...defaultStyle, ...alignStyle},
    }

    const props = _.omitBy(this.props, (v, k) => k === 'align')

    return (
      <SimpleButton {...props}
        defaultStyle={styles.def}
        activeStyle={styles.active}
        hoverStyle={styles.hover}
        innerStyle={innerStyle}
      />
    )
  }
}
