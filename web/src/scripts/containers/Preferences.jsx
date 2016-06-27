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
import React, { Component, } from 'react'
import { connect } from 'react-redux'
import { ROOT_KEY, CATEGORIES } from 'shared/constants/PreferencesConstants'
import { setSystemLocationPreference, setPreference, savePreferences } from '../actions/preferencesActions'
import LocalStorage from '../persistence/LocalStorage'
import PreferencesPage from '../components/pages/PreferencesPage'

const Preferences = ({dispatch, preferences}) => {
  return (
    <PreferencesPage
      onPreferenceChange={(categoryKey, key, value) => {
        dispatch(setPreference(categoryKey, key, value))
        dispatch(savePreferences())
      }}
      setSystemLocationPreference={(categoryKey, key, propertyType, title) => {
        dispatch(setSystemLocationPreference(categoryKey, key, propertyType, title)).then(() => {
          dispatch(savePreferences())
        })
      }}
      general={preferences[CATEGORIES.GENERAL]}
      saving={preferences[CATEGORIES.SAVING]}
      editor={preferences[CATEGORIES.EDITOR]}
      />
  )
}

const mapStateToProps = (state, ownProps) => {
  return {
    preferences: state.preferences,
  }
}

export default connect(mapStateToProps)(Preferences)
