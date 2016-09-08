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

import SimpleButton from './SimpleButton'

const styles = {
  base: {
    background: 'linear-gradient(rgb(255,255,255),rgb(250,250,250))',
    boxShadow: '0 0 0 1px rgb(229,229,229) inset, 0 1px 2px rgba(0,0,0,0.1)',
    height: 35,
    fontSize: '12px',
    fontWeight: 500,
    color: 'rgb(103,103,103)',
    cursor: 'default',
    borderRadius: 3,
    display: 'flex',
    paddingLeft: 10,
    paddingRight: 10,
  },
  hover: {
    background: 'linear-gradient(rgb(230,230,230),rgb(225,225,225))',
    boxShadow: '0 0 0 1px rgb(200,200,200) inset, 0 1px 1px rgba(0,0,0,0.1)',
  },
  active: {
    background: 'linear-gradient(rgb(242,242,242),rgb(237,237,237))',
    boxShadow: '0 0 0 1px rgb(212,212,212) inset, 0 1px 1px rgba(0,0,0,0.1)',
  },
  mainBase: {
    background: 'linear-gradient(#89DC6C,#62B246)',
    boxShadow: '0 0 0 1px #5CA941 inset, 0 1px 1px rgba(0,0,0,0.1)',
    color: 'white',
  },
  mainHover: {
    background: 'linear-gradient(#7BC461,#5DAA42)',
    boxShadow: '0 0 0 1px #5CA941 inset, 0 1px 1px rgba(0,0,0,0.1)',
  },
  mainActive: {
    background: 'linear-gradient(#80D064, #63B846)',
    boxShadow: '0 0 0 1px #5CA941 inset, 0 1px 1px rgba(0,0,0,0.1)',
  },
  destructiveBase: {
    background: 'linear-gradient(#DC6C6C,#B24646)',
    boxShadow: '0 0 0 1px #A94141 inset, 0 1px 1px rgba(0,0,0,0.1)',
    color: 'white',
  },
  destructiveHover: {
    background: 'linear-gradient(#B24646, #B24646)',
    boxShadow: '0 0 0 1px #A94141 inset, 0 1px 1px rgba(0,0,0,0.1)',
  },
  destructiveActive: {
    background: 'linear-gradient(#DC6C6C, #DC6C6C)',
    boxShadow: '0 0 0 1px #A94141 inset, 0 1px 1px rgba(0,0,0,0.1)',
  },
  inner: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  }
}

const ALIGN = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
}

export default class extends Component {

  static propTypes = {}

  static defaultProps = {
    align: 'center',
    type: 'normal',
  }

  constructor(props) {
    super(props)

    this.state = {}
  }

  render() {
    const {children, align, type} = this.props
    const inner = {
      justifyContent: ALIGN[align]
    }

    let {base, hover, active} = styles

    if (type === 'main') {
      base = {...styles.base, ...styles.mainBase}
      hover = styles.mainHover
      active = styles.mainActive
    } else if (type === 'destructive') {
      base = {...styles.base, ...styles.destructiveBase}
      hover = styles.destructiveHover
      active = styles.destructiveActive
    }

    return (
      <SimpleButton
        {...this.props}
        defaultStyle={base}
        activeStyle={{...base, ...active}}
        hoverStyle={{...base, ...hover}}
        innerStyle={{...styles.inner, ...inner}}
      >
        {children}
      </SimpleButton>
    )
  }
}
