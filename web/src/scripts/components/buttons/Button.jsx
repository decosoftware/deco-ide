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

import React, { Component } from 'react'
import { StylesEnhancer } from 'react-styles-provider'
import pureRender from 'pure-render-decorator'

import SimpleButton from '../buttons/SimpleButton'

const stylesCreator = () => {
  const styles = {
    normal: {
      display: 'flex',
      justifyContent: 'center',
      color: "rgb(58,58,58)",
      backgroundColor: "#ffffff",
      border: '1px solid ' + "rgba(163,163,163,0.52)",
      borderRadius: '3px',
      textDecoration: 'none',
      padding: '0 8px',
      height: '20px',
      fontSize: 11,
      fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
      cursor: 'default',
      flex: '0 0 75px',
      fontWeight: '400',
    },
    inner: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }

  styles.active = {...styles.normal, backgroundColor: "rgba(234,233,234,0.5)"}
  styles.hover = {...styles.normal, backgroundColor: "rgba(234,233,234, 1)"}

  return styles
}

@StylesEnhancer(stylesCreator)
@pureRender
export default class PropertyStringInput extends Component {

  static defaultProps = {
    children: null,
  }

  render() {
    const {styles, children, onClick} = this.props

    return (
      <SimpleButton
        onClick={onClick}
        defaultStyle={styles.normal}
        activeStyle={styles.active}
        hoverStyle={styles.hover}
        innerStyle={styles.inner}
      >
        {children}
      </SimpleButton>
    )
  }
}
