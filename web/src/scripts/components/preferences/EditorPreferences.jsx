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

import { THEMES } from '../../utils/editor/ThemeUtils'
import FormRow from '../forms/FormRow'
import StringInput from '../input/StringInput'
import SelectInput from '../input/SelectInput'
import NumberInput from '../input/NumberInput'
import SliderInput from '../input/SliderInput'
import CheckboxInput from '../input/CheckboxInput'
import ColorInput from '../input/ColorInput'

import { PREFERENCES, METADATA, CATEGORIES } from 'shared/constants/PreferencesConstants'

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

export default ({
  onPreferenceChange,
  vimMode,
  showInvisibles,
  highlightActiveLine,
  showIndentGuides,
  npmRegistry,
  theme,
  fontSize,
}) => {
  return (
    <div style={style}>
      <FormRow
        label={'Theme'}
        labelWidth={LABEL_WIDTH}
      >
        <SelectInput
          value={theme}
          options={THEMES}
          onChange={onPreferenceChange.bind(null, PREFERENCES.EDITOR.THEME)}
        />
      </FormRow>
      <FormRow
        label={'Font Size'}
        labelWidth={LABEL_WIDTH}
      >
        <SliderInput
          value={fontSize}
          min={8}
          max={32}
          onChange={onPreferenceChange.bind(null, PREFERENCES.EDITOR.FONT_SIZE)}
        />
        <div
          key={'Spacer'}
          style={{marginRight: 10}}
        />
        <NumberInput
          key={'NumberInput'}
          value={fontSize}
          width={40}
          onChange={onPreferenceChange.bind(null, PREFERENCES.EDITOR.FONT_SIZE)} 
        />
      </FormRow>
      <FormRow
        label={'Vim Mode'}
        labelWidth={LABEL_WIDTH}
      >
        <CheckboxInput
          value={vimMode}
          onChange={onPreferenceChange.bind(null, PREFERENCES.EDITOR.VIM_MODE)}
        />
      </FormRow>
      <FormRow
        label={'Show Invisibles'}
        labelWidth={LABEL_WIDTH}
      >
        <CheckboxInput
          value={showInvisibles}
          onChange={onPreferenceChange.bind(null, PREFERENCES.EDITOR.SHOW_INVISIBLES)}
        />
      </FormRow>
      <FormRow
        label={'Show Indent Guides'}
        labelWidth={LABEL_WIDTH}
      >
        <CheckboxInput
          value={showIndentGuides}
          onChange={onPreferenceChange.bind(null, PREFERENCES.EDITOR.SHOW_INDENT_GUIDES)}
        />
      </FormRow>
      <FormRow
        label={'Highlight Active Line'}
        labelWidth={LABEL_WIDTH}
      >
        <CheckboxInput
          value={highlightActiveLine}
          onChange={onPreferenceChange.bind(null, PREFERENCES.EDITOR.HIGHLIGHT_ACTIVE_LINE)}
        />
      </FormRow>
      <FormRow
        label={'NPM Registry'}
        labelWidth={LABEL_WIDTH}
      >
        <StringInput
          value={npmRegistry}
          placeholder={METADATA[CATEGORIES.EDITOR][PREFERENCES[CATEGORIES.EDITOR].NPM_REGISTRY].defaultValue}
          onChange={onPreferenceChange.bind(null, PREFERENCES.EDITOR.NPM_REGISTRY)}
        />
      </FormRow>
    </div>
  )
}
