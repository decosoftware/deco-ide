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
import ToggleButton from 'react-toggle-button'

import { StylesEnhancer } from 'react-styles-provider'

const stylesCreator = ({fonts}) => {
  return {
    container: {
      position: 'relative',
      height: 30,
      marginRight: 11,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    termTitleText: {
      marginRight: 8,
      ...fonts.regularSubtle,
    },
    inactiveLabel: {
      marginRight: 2,
    },
  }
}

@StylesEnhancer(stylesCreator)
export default class extends Component {
  render() {
    const {styles, isRunning, onClick} = this.props

    return (
      <div style={styles.container}>
        <div style={styles.termTitleText}>
          {isRunning ? 'Packager running' : 'Run packager'}
        </div>
        <div
          onMouseDown={onClick}
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <ToggleButton
            value={isRunning}
            colors={{
              active: {base: 'rgb(18, 80, 146)'},
            }}
            inactiveLabelStyle={styles.inactiveLabel}
          />
        </div>
      </div>
    )
  }
}
