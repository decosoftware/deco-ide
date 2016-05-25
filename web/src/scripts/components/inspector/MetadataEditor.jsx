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
import ReactDOM from 'react-dom'

import PrimitiveTypes from '../../constants/PrimitiveTypes'
import { EDIT_WITH, EDIT_WITH_DISPLAY_NAME } from '../../constants/LiveValueConstants'

import FormRow from '../forms/FormRow'
import StringInput from '../input/StringInput'
import SelectInput from '../input/SelectInput'
import NumberInput from '../input/NumberInput'
import SliderInput from '../input/SliderInput'
import CheckboxInput from '../input/CheckboxInput'
import ColorInput from '../input/ColorInput'

const menuStyle = {
  position: 'absolute',
  paddingTop: 5,
  paddingBottom: 5,
  background: 'rgb(252,251,252)',
  borderRadius: '3px',
  boxShadow: '0 2px 8px 1px rgba(0,0,0,0.3)',
  border: '1px solid rgba(0,0,0,0.2)',
  width: 232,
}

const INPUT_WIDTH = 130

class MetadataEditor extends Component {

  constructor(props) {
    super(props)
    this.state = {
      groupNameInProgress: null,
    }
  }

  componentDidMount() {
    const nameElement = ReactDOM.findDOMNode(this.refs.nameInput)
    nameElement.focus()
    return nameElement.setSelectionRange(0, nameElement.value.length)
  }

  renderFormForType() {
    const {metadata, onMetadataChange, requestClose} = this.props
    const elements = []

    switch (metadata.type) {
      case PrimitiveTypes.STRING:
        const stringEditOptions = _.map(EDIT_WITH, (value) => {
          return {
            value,
            displayName: EDIT_WITH_DISPLAY_NAME[value],
          }
        })

        elements.push(
          <FormRow
            key={'editWith'}
            label={'Edit With'}
            inputWidth={INPUT_WIDTH}>
            <SelectInput
              value={metadata.editWith}
              options={stringEditOptions}
              width={INPUT_WIDTH}
              onChange={onMetadataChange.bind(null, 'editWith')} />
          </FormRow>
        )

        return elements
      break
      case PrimitiveTypes.NUMBER:
        elements.push(
          <FormRow
            key={'min'}
            label={'Minimum'}
            inputWidth={INPUT_WIDTH}>
            <NumberInput
              value={metadata.min || 0}
              width={INPUT_WIDTH}
              onChange={onMetadataChange.bind(null, 'min')}
              onSubmit={requestClose} />
          </FormRow>
        )

        elements.push(
          <FormRow
            key={'max'}
            label={'Maximum'}
            inputWidth={INPUT_WIDTH}>
            <NumberInput
              value={metadata.max || 100}
              width={INPUT_WIDTH}
              onChange={onMetadataChange.bind(null, 'max')}
              onSubmit={requestClose} />
          </FormRow>
        )
      break
      case PrimitiveTypes.BOOLEAN:

      break
    }

    return elements
  }

  render() {
    const {metadata, onMetadataChange, requestClose} = this.props

    const groupNameInProgress = this.state.groupNameInProgress
    const groupName = groupNameInProgress !== null ? groupNameInProgress : metadata.group

    return (
      <div style={menuStyle}>
        <FormRow
          key={'name'}
          label={'Name'}
          inputWidth={INPUT_WIDTH}>
          <StringInput
            ref={'nameInput'}
            value={metadata.name}
            onChange={onMetadataChange.bind(null, 'name')}
            onSubmit={requestClose} />
        </FormRow>
        <FormRow
          key={'group'}
          label={groupNameInProgress !== null ? '↵ to confirm' : 'Group'}
          inputWidth={INPUT_WIDTH}>
          <StringInput
            value={groupName || ''}
            onChange={(value) => {
              this.setState({
                groupNameInProgress: value,
              })
            }}
            onSubmit={(value) => {
              this.setState({
                groupNameInProgress: null,
              })
              onMetadataChange('group', value)
            }} />
        </FormRow>
        {this.renderFormForType()}
      </div>
    )
  }
}

MetadataEditor.defaultProps = {
  requestClose: () => {},
}

export default MetadataEditor
