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
import { StylesEnhancer } from 'react-styles-provider'

const stylesCreator = ({colors}) => {
  return {
    main: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.35)',
      textShadow: '0 1px 0 rgba(0,0,0,0.2)',
      paddingBottom: 20,
      textAlign: 'center',
      WebkitFontSmoothing: 'antialiased',
    },
    container: {
      display: 'flex',
      flex: '1 0 auto',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backgroundColor: colors.editor.background,
    }
  }
}

@StylesEnhancer(stylesCreator)
export default class extends Component {

  render() {
    const {styles, children} = this.props

    return (
      <div style={styles.container}>
        <div style={styles.main}>
          {children}
        </div>
      </div>
    )
  }
}
