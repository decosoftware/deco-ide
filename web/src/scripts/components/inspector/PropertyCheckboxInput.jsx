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

const stylesCreator = ({fonts}) => ({
  checkbox: {
    height: 30,
  },
})

@StylesEnhancer(stylesCreator)
@pureRender
export default class PropertyCheckboxInput extends Component {

  static defaultProps = {
    title: '',
    value: true,
  }

  render() {
    const {styles, title, value, onChange, actions, dividerType, disabled} = this.props

    return (
      <PropertyField
        title={title}
        actions={actions}
        dividerType={dividerType}
      >
        <div style={styles.checkbox}>
          <CheckboxInput
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
      </PropertyField>
    )
  }
}
