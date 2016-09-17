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
import SelectInput from '../input/SelectInput'
import CheckboxInput from '../input/CheckboxInput'
import themes from '../../themes'

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

export default ({onPreferenceChange, setSystemLocationPreference, decoTheme, androidHome, pathToGenymotionApp, useGenymotion, publishingFeature}) => {
  return (
    <div style={style}>
      <FormRow
        label={'Deco UI Theme'}
        labelWidth={LABEL_WIDTH}
      >
        <SelectInput
          value={decoTheme}
          options={themes.map(item => ({value: item.id, displayName: item.name}))}
          onChange={onPreferenceChange.bind(null, PREFERENCES.GENERAL.DECO_THEME)}
        />
      </FormRow>
      <FormRow
        label={'Android SDK Location'}
        labelWidth={LABEL_WIDTH}
      >
        <FileSelectorInput
          value={androidHome}
          onClickButton={setSystemLocationPreference.bind(null, PREFERENCES.GENERAL.ANDROID_HOME, 'openDirectory', 'Choose Android SDK Location')}
          placeholder={METADATA[CATEGORIES.GENERAL][PREFERENCES[CATEGORIES.GENERAL].ANDROID_HOME].defaultValue}
        />
      </FormRow>
      <FormRow
        label={'Genymotion Install Location'}
        labelWidth={LABEL_WIDTH}
      >
        <FileSelectorInput
          value={pathToGenymotionApp}
          onClickButton={setSystemLocationPreference.bind(null, PREFERENCES.GENERAL.GENYMOTION_APP, 'openFile', 'Choose Genymotion Install Location')}
          placeholder={METADATA[CATEGORIES.GENERAL][PREFERENCES[CATEGORIES.GENERAL].GENYMOTION_APP].defaultValue}
        />
      </FormRow>
      <FormRow
        label={'Enable Experimental Component Publishing'}
        labelWidth={LABEL_WIDTH}
      >
        <CheckboxInput
          value={publishingFeature}
          type={'platform'}
          onChange={onPreferenceChange.bind(null, PREFERENCES.GENERAL.PUBLISHING_FEATURE)}
        />
      </FormRow>
    </div>
  )
}
