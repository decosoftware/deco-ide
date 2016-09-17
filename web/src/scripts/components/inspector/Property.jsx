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

import PrimitiveTypes from '../../constants/PrimitiveTypes'
import { EDIT_WITH, DROPDOWN_OPTIONS } from '../../constants/LiveValueConstants'
import PropertyCheckboxInput from './PropertyCheckboxInput'
import PropertyStringInput from './PropertyStringInput'
import PropertyNumberInput from './PropertyNumberInput'
import PropertySelectInput from './PropertySelectInput'
import PropertyColorInput from './PropertyColorInput'

const stylesCreator = () => ({})

@StylesEnhancer(stylesCreator)
export default class Property extends Component {

  static defaultProps = {
    prop: {},
    onChange: () => {},
    onValueChange: () => {}
  }

  onChange = (value) => {
    const {prop, onChange, onValueChange} = this.props

    onValueChange(value)
    onChange({...prop, value})
  }

  getDropdownOptions(dropdownOptions) {
    if (typeof dropdownOptions === 'string') {
      return DROPDOWN_OPTIONS[dropdownOptions] || []
    } else {
      return dropdownOptions || []
    }
  }

  render() {
    const {styles, prop, onChange} = this.props
    const {name, value, type, editWith} = prop

    const inputProps = {
      value,
      title: name,
      onChange: this.onChange,
    }

    switch (type) {

      case PrimitiveTypes.STRING: {
        switch (editWith) {

          case EDIT_WITH.COLOR_PICKER: {
            return (
              <PropertyColorInput {...inputProps} />
            )
          }

          case EDIT_WITH.DROPDOWN: {
            return (
              <PropertySelectInput
                {...inputProps}
                options={this.getDropdownOptions(prop.dropdownOptions)}
                showValueAsOption={true}
              />
            )
          }

          case EDIT_WITH.INPUT_FIELD: // Fallthrough
          default: {
            return (
              <PropertyStringInput {...inputProps} />
            )
          }
        }
      }

      case PrimitiveTypes.NUMBER: {
        return (
          <PropertyNumberInput {...inputProps} />
        )
      }

      case PrimitiveTypes.BOOLEAN: {
        return (
          <PropertyCheckboxInput {...inputProps} />
        )
      }

      default: {
        return null
      }
    }
  }
}
