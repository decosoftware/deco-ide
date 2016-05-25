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

import MetadataEditor from './MetadataEditor'
import FormRow from '../forms/FormRow'
import StringInput from '../input/StringInput'
import SelectInput from '../input/SelectInput'
import NumberInput from '../input/NumberInput'
import SliderInput from '../input/SliderInput'
import CheckboxInput from '../input/CheckboxInput'
import ColorInput from '../input/ColorInput'
import Menu from '../menu/Menu'

const INPUT_WIDTH = 115

class LiveValue extends Component {

  constructor(props) {
    super(props)

    this.state = {
      showMenu: false,
      menuPosition: {
        x: 0,
        y: 0,
      }
    }

    this.setMenuVisibility = this.setMenuVisibility.bind(this)
    this.setMenuVisibility = _.throttle(this.setMenuVisibility, 100, {
      leading: true,
      trailing: false
    })
  }

  setMenuVisibility(visible) {
    this.setState({
      showMenu: visible
    })
  }

  render() {
    const {id, value, metadata, onChange, inset, width} = this.props

    let inputElement = null

    switch (metadata.type) {
      case PrimitiveTypes.STRING:
        switch (metadata.editWith) {
          case EDIT_WITH.COLOR_PICKER:
            inputElement = (
              <ColorInput
                value={value}
                onChange={onChange} />
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
                width={115}
                onChange={onChange} />
            )
          break
          case EDIT_WITH.INPUT_FIELD: // Fallthrough
          default:
            inputElement = (
              <StringInput
                value={value}
                onChange={onChange} />
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
            onChange={onChange} />,
          <div
            key={'Spacer'}
            style={{marginRight: 10}} />,
          <NumberInput
            key={'NumberInput'}
            value={value}            
            onChange={onChange} />,
        ]
      break
      case PrimitiveTypes.BOOLEAN:
        inputElement = (
          <CheckboxInput
            value={value}
            onChange={onChange} />
        )
      break
    }

    return (
      <FormRow
        label={metadata.name}
        statefulLabel={true}
        labelEnabled={this.state.showMenu}
        labelWidth={width - INPUT_WIDTH}
        inset={inset}
        inputWidth={INPUT_WIDTH}
        onLabelChange={() => {
          this.setMenuVisibility(! this.state.showMenu)
        }}
        onLabelPositionChange={({x, y, width}) => {
          this.setState({
            menuPosition: {
              x: x - width / 2,
              y,
            },
            caretOffset: {
              x: Math.max(width / 2, 5),
              y: 0,
            },
          })
        }}>
        {inputElement}
        <Menu show={this.state.showMenu}
          caret={true}
          caretOffset={this.state.caretOffset}
          requestClose={this.setMenuVisibility.bind(null, false)}
          anchorPosition={this.state.menuPosition}>
          {
            this.state.showMenu && (
              <MetadataEditor
                id={id}
                metadata={metadata}
                onMetadataChange={this.props.onMetadataChange}
                requestClose={this.setMenuVisibility.bind(null, false)} />
            )
          }
        </Menu>
      </FormRow>
    )
  }

}

LiveValue.propTypes = {
  id: React.PropTypes.string.isRequired,
  value: React.PropTypes.any,
  metadata: React.PropTypes.object.isRequired,
  onChange: React.PropTypes.func.isRequired,
  inset: React.PropTypes.number,
}

LiveValue.defaultProps = {
  inset: 0,
  onMetadataChange: () => {},
}

export default LiveValue
