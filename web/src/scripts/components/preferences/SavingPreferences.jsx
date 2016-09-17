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

import FormRow from '../forms/FormRow'
import StringInput from '../input/StringInput'
import SelectInput from '../input/SelectInput'
import NumberInput from '../input/NumberInput'
import SliderInput from '../input/SliderInput'
import CheckboxInput from '../input/CheckboxInput'
import ColorInput from '../input/ColorInput'

import { PREFERENCES } from 'shared/constants/PreferencesConstants'

const style = {
  display: 'flex',
  flexDirection: 'column',
  flex: '0 1 auto',
  padding: 10,
  overflowX: 'hidden',
  overflowY: 'auto',
}

const LABEL_WIDTH = 140
const INSET_LEVEL = 15

export default ({onPreferenceChange, autosave, propertyChange, textEdit, debounce}) => {
  return (
    <div style={style}>
      <FormRow
        label={'Autosave'}
        labelWidth={LABEL_WIDTH}
      >
        <CheckboxInput
          value={autosave}
          onChange={onPreferenceChange.bind(null, PREFERENCES.SAVING.AUTOSAVE)}
        />
      </FormRow>
      <FormRow
        label={'On property change'}
        disabled={! autosave}
        inset={INSET_LEVEL}
        labelWidth={LABEL_WIDTH}
      >
        <CheckboxInput
          value={propertyChange}
          onChange={onPreferenceChange.bind(null, PREFERENCES.SAVING.PROPERTY_CHANGE)}
        />
      </FormRow>
      <FormRow
        label={'On text edit'}
        disabled={! autosave}
        inset={INSET_LEVEL}
        labelWidth={LABEL_WIDTH}
      >
        <CheckboxInput
          value={textEdit}
          onChange={onPreferenceChange.bind(null, PREFERENCES.SAVING.TEXT_EDIT)}
        />
      </FormRow>
      <FormRow
        label={'Debounce (ms)'}
        disabled={! (autosave && textEdit)}
        inset={INSET_LEVEL * 2}
        labelWidth={LABEL_WIDTH}
      >
        <SliderInput
          key={'SliderInput'}
          value={debounce}
          min={0}
          max={3000}
          type={'platform'}
          onChange={onPreferenceChange.bind(null, PREFERENCES.SAVING.DEBOUNCE)}
        />
        <div key={'Spacer'} style={{marginRight: 10}} />
        <NumberInput
          key={'NumberInput'}
          value={debounce}
          width={40}
          type={'platform'}
          onChange={onPreferenceChange.bind(null, PREFERENCES.SAVING.DEBOUNCE)}
        />
      </FormRow>
    </div>
  )
}
