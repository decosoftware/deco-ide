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

import _ from 'lodash'
import React, { Component } from 'react'

import PrimitiveTypes from '../../constants/PrimitiveTypes'
import { EDIT_WITH, DROPDOWN_OPTIONS } from '../../constants/LiveValueConstants'

import InspectorField from './InspectorField'
import MetadataEditor from './MetadataEditor'
import FormRow from '../forms/FormRow'
import StringInput from '../input/StringInput'
import SelectInput from '../input/SelectInput'
import NumberInput from '../input/NumberInput'
import SliderInput from '../input/SliderInput'
import CheckboxInput from '../input/CheckboxInput'
import ColorInput from '../input/ColorInput'

const INPUT_WIDTH = INPUT_WIDTH

const styles = {
  numberInputSpacer: {
    marginRight: 10,
  },
  numberInputField: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: '1 1 auto',
    minWidth: 0,
    minHeight: 0,
  }
}

export default class extends Component {

  static propTypes = {
    id: React.PropTypes.string,
    value: React.PropTypes.any,
    metadata: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired,
    onMetadataChange: React.PropTypes.func,
    onDelete: React.PropTypes.func,
    inset: React.PropTypes.number,
    width: React.PropTypes.number,
  }

  static defaultProps = {
    inset: 0,
    deletable: false,
    onMetadataChange: () => {},
  }

  render() {
    const {id, value, metadata, onChange, onMetadataChange, deletable, onDelete, addable, onAdd, disabledFields, inset, width} = this.props
    const {name} = metadata

    let inputElement

    switch (metadata.type) {
      case PrimitiveTypes.RAW:
      case PrimitiveTypes.STRING:
        switch (metadata.editWith) {
          case EDIT_WITH.COLOR_PICKER:
            inputElement = (
              <ColorInput
                value={value}
                onChange={onChange}
              />
            )
          break
          case EDIT_WITH.DROPDOWN:
            let dropdownOptions
            if (typeof metadata.dropdownOptions === 'string') {
              dropdownOptions = DROPDOWN_OPTIONS[metadata.dropdownOptions] || []
            } else {
              dropdownOptions = metadata.dropdownOptions || []
            }

            inputElement = (
              <SelectInput
                value={value}
                options={dropdownOptions}
                showValueAsOption={true}
                width={INPUT_WIDTH}
                onChange={onChange}
              />
            )
          break
          case EDIT_WITH.INPUT_FIELD: // Fallthrough
          default:
            inputElement = (
              <StringInput
                value={value}
                onChange={onChange}
              />
            )
          break
        }
      break
      case PrimitiveTypes.NUMBER:
        inputElement = [
          <SliderInput
            key={'SliderInput'}
            value={value}
            width={40}
            min={metadata.min}
            max={metadata.max}
            onChange={onChange}
          />,
          <div
            key={'Spacer'}
            style={styles.numberInputSpacer}
          />,
          <div
            style={styles.numberInputField}
            key={'NumberInput'}
          >
            <NumberInput
              value={value}
              onChange={onChange}
            />
          </div>,
        ]
      break
      case PrimitiveTypes.BOOLEAN:
        inputElement = (
          <CheckboxInput
            value={value}
            onChange={onChange}
          />
        )
      break
    }

    return (
      <InspectorField
        name={name}
        inset={inset}
        width={width}
        inputElement={inputElement}
        addable={addable}
        onAdd={onAdd}
        deletable={deletable}
        onDelete={onDelete}
        menuElement={(
          <MetadataEditor
            id={id}
            metadata={metadata}
            onMetadataChange={onMetadataChange}
            disabledFields={disabledFields}
          />
        )}
      />
    )
  }
}
