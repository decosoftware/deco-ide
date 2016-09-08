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

const styles = {
  container: {
    height: 30,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    paddingLeft: 10,
    minWidth: 0,
  },
  button: {
    fontSize: 18,
    fontWeight: 300,
  }
}

export default class extends Component {

  static defaultProps = {
    inset: 0,
  }

  render() {
    const {children, label, inset, labelWidth, disabled} = this.props

    // TODO consolidate styles - similar to formlabel
    let labelStyle = {
      lineHeight: '30px',
      color: 'rgb(73,73,73)',
      fontSize: 11,
      paddingLeft: inset,
      flex: labelWidth ? `0 0 ${labelWidth}px` : `1 1 auto`,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      fontWeight: 'bold',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }

    if (disabled) {
      labelStyle = Object.assign({}, labelStyle, {
        color: 'rgb(170,170,170)',
      })
    }

    return (
      <div style={styles.container}>
        <div style={labelStyle}
          title={label}>
          {label}
          {children}
        </div>
      </div>
    )
  }
}
