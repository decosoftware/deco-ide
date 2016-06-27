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
import _ from 'lodash'

import Toolbar from '../toolbar/Toolbar'
import ToolbarButton from '../buttons/ToolbarButton'
import ToolbarButtonGroup from '../buttons/ToolbarButtonGroup'
import GeneralPreferences from '../preferences/GeneralPreferences'
import SavingPreferences from '../preferences/SavingPreferences'
import EditorPreferences from '../preferences/EditorPreferences'

import { CATEGORIES, PREFERENCES } from 'shared/constants/PreferencesConstants'

const style = {
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  width: '100%',
  height: '100%',
  backgroundColor: 'rgb(245,245,245)',
  overflow: 'hidden',
}

const buttonGroupStyle = {
  display: 'flex',
  flexDirection: 'row',
  marginLeft: 15,
  marginRight: 15,
}

const setIndex = (i, indexes) => {
  const idxs = _.map(indexes, () => {
    return false
  })
  idxs[i] = true
  return idxs
}

class PreferencesPage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      activeIndexes: [true, false],
    }
  }
  renderCategory() {
    const activeIndex = _.indexOf(this.state.activeIndexes, true)
    switch (activeIndex) {
      case 0:
        return (
          <GeneralPreferences
            onPreferenceChange={this.props.onPreferenceChange.bind(null, CATEGORIES.GENERAL)}
            setSystemLocationPreference={this.props.setSystemLocationPreference.bind(null, CATEGORIES.GENERAL)}
            androidHome={this.props.general[PREFERENCES.GENERAL.ANDROID_HOME]}
            pathToGenymotionApp={this.props.general[PREFERENCES.GENERAL.GENYMOTION_APP]}
            useGenymotion={this.props.general[PREFERENCES.GENERAL.USE_GENYMOTION]} />
        )
      case 1:
        return (
          <SavingPreferences
            onPreferenceChange={this.props.onPreferenceChange.bind(null, CATEGORIES.SAVING)}
            autosave={this.props.saving[PREFERENCES.SAVING.AUTOSAVE]}
            propertyChange={this.props.saving[PREFERENCES.SAVING.PROPERTY_CHANGE]}
            textEdit={this.props.saving[PREFERENCES.SAVING.TEXT_EDIT]}
            debounce={this.props.saving[PREFERENCES.SAVING.DEBOUNCE]} />
        )
      case 2:
        return (
          <EditorPreferences
            onPreferenceChange={this.props.onPreferenceChange.bind(null, CATEGORIES.EDITOR)}
            vimMode={this.props.editor[PREFERENCES.EDITOR.VIM_MODE]}
            showInvisibles={this.props.editor[PREFERENCES.EDITOR.SHOW_INVISIBLES]}
            highlightActiveLine={this.props.editor[PREFERENCES.EDITOR.HIGHLIGHT_ACTIVE_LINE]}
            showIndentGuides={this.props.editor[PREFERENCES.EDITOR.SHOW_INDENT_GUIDES]}
            npmRegistry={this.props.editor[PREFERENCES.EDITOR.NPM_REGISTRY]} />
        )
      default:
        return null
    }
  }
  render() {
    return (
      <div style={style}>
        <Toolbar
          title={'Preferences'}
          height={71}>
          <ToolbarButtonGroup
            theme={ToolbarButtonGroup.THEME.PLAIN}
            activeIndexes={this.state.activeIndexes}
            style={buttonGroupStyle}>
            <ToolbarButton
              text={'General'}
              icon={'project-settings'}
              onClick={() => {
                this.setState({
                  activeIndexes: setIndex(0, this.state.activeIndexes)
                })
              }} />
            <ToolbarButton
              text={'Saving'}
              icon={'save'}
              onClick={() => {
                this.setState({
                  activeIndexes: setIndex(1, this.state.activeIndexes)
                })
              }} />
            <ToolbarButton
              text={'Editor'}
              icon={'docs'}
              onClick={() => {
                this.setState({
                  activeIndexes: setIndex(2, this.state.activeIndexes)
                })
              }} />
          </ToolbarButtonGroup>
        </Toolbar>
        {this.renderCategory()}
      </div>
    )
  }
}

export default PreferencesPage
