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
  base: {
    borderStyle: 'solid',
    borderWidth: 0,
    padding: 10,
    lineHeight: '18px',
    cursor: 'default',
  },
  info: {
    background: 'rgb(245,245,245)',
    borderColor: 'rgb(228,228,228)',
    color: '#636363',
  },
  success: {
    background: '#BBE9AB',
    borderColor: '#A2CD93',
    color: '#357B1C',
  }
}

export default class extends Component {

  static propTypes = {}

  static defaultProps = {
    type: 'info',
    isTop: false,
    isBottom: false,
  }

  constructor(props) {
    super(props)

    this.state = {}
  }

  render() {
    const {children, type, isTop, isBottom} = this.props

    const style = {
      ...styles.base,
      ...styles[type],
      ...({
        borderTopWidth: isTop ? 0 : 1,
        borderBottomWidth: isBottom ? 0 : 1,
      })
    }

    return (
      <div style={style}>
        {children}
      </div>
    )
  }
}
