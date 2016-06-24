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
import FileSelectorInput from '../input/FileSelectorInput'
import CheckboxInput from '../input/CheckboxInput'

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

export default ({onPreferenceChange, setSystemLocationPreference, androidHome, useGenymotion}) => {
  return (
    <div style={style}>
      <FormRow
        label={'Android SDK Location'}
        labelWidth={LABEL_WIDTH}>
        <FileSelectorInput
          value={androidHome}
          onSelectFile={setSystemLocationPreference.bind(null, PREFERENCES.GENERAL.ANDROID_HOME, 'openDirectory', 'Choose Android SDK Location')}
          placeholder={METADATA[CATEGORIES.GENERAL][PREFERENCES[CATEGORIES.GENERAL].ANDROID_HOME].defaultValue} />
      </FormRow>
      <FormRow
        label={'Use Genymotion'}
        labelWidth={LABEL_WIDTH}>
        <CheckboxInput
          value={useGenymotion}
          onChange={onPreferenceChange.bind(null, PREFERENCES.GENERAL.USE_GENYMOTION)} />
      </FormRow>
    </div>
  )
}
