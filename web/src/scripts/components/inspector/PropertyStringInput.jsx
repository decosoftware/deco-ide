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
import StringInput from '../input/StringInput'

const stylesCreator = ({fonts}) => ({
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    display: 'flex',
    height: 30,
  },
})

@StylesEnhancer(stylesCreator)
@pureRender
export default class PropertyStringInput extends Component {

  static defaultProps = {
    title: '',
    value: '',
  }

  render() {
    const {styles, title, value, onChange} = this.props

    return (
      <PropertyField
        title={title}
      >
        <div style={styles.row}>
          <StringInput
            value={value}
            width={'100%'}
            onChange={onChange}
          />
        </div>
        <PropertyDivider />
      </PropertyField>
    )
  }
}
