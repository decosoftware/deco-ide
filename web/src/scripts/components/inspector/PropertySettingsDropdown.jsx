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
import update from 'react-addons-update'

import PropertySelectInput from './PropertySelectInput'
import PropertyNumberInput from './PropertyNumberInput'
import PropertyField from './PropertyField'
import PropertyDivider from './PropertyDivider'
import Property from './Property'
import ValueInput from '../input/ValueInput'
import StringInput from '../input/StringInput'
import PropertyListInput from './PropertyListInput'
import DropdownMenuButton from '../buttons/DropdownMenuButton'
import PropertyRemoveButton from './PropertyRemoveButton'
import PropertySettingsButton from './PropertySettingsButton'
import * as Parser from '../../utils/Parser'
import PrimitiveTypes, { OPTIONS } from '../../constants/PrimitiveTypes'

const stylesCreator = ({colors, fonts}) => ({
  dropdownMenuInner: {
    width: 180,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: 15,
  },
  divider: {
    height: 20,
  },
})

@StylesEnhancer(stylesCreator)
@pureRender
export default class PropertySettingsDropdown extends Component {

  static defaultProps = {
    prop: null,
    onChange: () => {},
    onChangeKey: () => {},
  }

  changePropType = (newType) => {
    const {prop, onChange} = this.props
    const {type: oldType, value} = prop

    onChange(update(prop, {
      $merge: {
        type: newType,
        value: Parser.castType(value, oldType, newType),
      },
    }))
  }

  renderField = (Component, key, title) => {
    const {prop, onChangeKey} = this.props

    return (
      <Component
        key={key}
        title={title}
        value={prop[key]}
        onChange={onChangeKey.bind(this, key)}
        dividerType={'none'}
      />
    )
  }

  renderTypeField = () => {
    const {prop} = this.props
    const {type} = prop

    return (
      <PropertySelectInput
        title={'Type'}
        value={type}
        onChange={this.changePropType}
        options={OPTIONS}
        showValueAsOption={false}
        dividerType={'none'}
      />
    )
  }

  renderWithDividers = (elements) => {
    const {styles} = this.props

    return elements.reduce((acc, element, i, list) => {
      acc.push(element)

      if (i < list.length - 1) {
        const divider = <div style={styles.divider} />

        acc.push(divider)
      }

      return acc
    }, [])
  }

  renderFields = () => {
    const {prop} = this.props
    const {type} = prop

    let fields = [
      this.renderTypeField(),
    ]

    switch (type) {
      case PrimitiveTypes.NUMBER: {
        fields = [
          ...fields,
          this.renderField(PropertyNumberInput, 'min', 'Minimum'),
          this.renderField(PropertyNumberInput, 'max', 'Maximum'),
          this.renderField(PropertyNumberInput, 'step', 'Step'),
        ]
        break
      }
    }

    return this.renderWithDividers(fields)
  }

  render() {
    const {styles} = this.props

    return (
      <div style={styles.dropdownMenuInner}>
        {this.renderFields()}
      </div>
    )
  }
}
