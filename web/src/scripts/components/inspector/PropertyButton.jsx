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

import PropertyField from './PropertyField'
import PropertyDivider from './PropertyDivider'
import CheckboxInput from '../input/CheckboxInput'

const stylesCreator = ({colors, fonts}) => ({
  button: {
    alignSelf: 'flex-start',
    paddingLeft: 10,
    paddingRight: 10,
    height: 30,
    borderStyle: 'solid',
    borderColor: colors.divider,
    borderWidth: 2,
    borderRadius: 4,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    ...fonts.buttonSmall,
  }
})

@StylesEnhancer(stylesCreator)
@pureRender
export default class PropertyButton extends Component {

  render() {
    let {styles, children, onClick} = this.props

    children = typeof children === 'string' ? children.toUpperCase() : children

    return (
      <div style={styles.button} onClick={onClick}>
        {children}
      </div>
    )
  }
}
