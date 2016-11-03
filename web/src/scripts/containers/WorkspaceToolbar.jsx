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

const shell = window.Electron.shell

import _ from 'lodash'
import React, { Component, } from 'react'
import { Link, } from 'react-router'
import { connect } from 'react-redux'
import { StylesEnhancer } from 'react-styles-provider'

import {
  save,
  runSimulator,
  runPackager,
  hardReloadSimulator,
  getAvailableSimulators,
} from '../actions/applicationActions'

import { CATEGORIES, PREFERENCES } from 'shared/constants/PreferencesConstants'
import { setPreference, savePreferences } from '../actions/preferencesActions'

import {
  setConsoleVisibility,
  setLeftSidebarVisibility,
  setRightSidebarContent,
  setSimulatorMenuPlatform,
} from '../actions/uiActions'
import { RIGHT_SIDEBAR_CONTENT, LAYOUT_FIELDS } from '../constants/LayoutConstants'

import ThemedToolbar, { STOPLIGHT_BUTTONS_WIDTH } from '../components/toolbar/ThemedToolbar'
import ThemedToolbarButton from '../components/toolbar/ThemedToolbarButton'
import ThemedToolbarButtonGroup from '../components/toolbar/ThemedToolbarButtonGroup'
import DropdownMenuButton from '../components/buttons/DropdownMenuButton'
import LandingButton from '../components/buttons/LandingButton'
import { ProcessStatus, } from '../constants/ProcessStatus'
import OnboardingUtils from '../utils/OnboardingUtils'
import SimulatorUtils from '../utils/SimulatorUtils'
import SimulatorMenu from '../components/menu/SimulatorMenu'

const dropdownMenuOffset = {
  x: 0,
  y: -2,
}

const stylesCreator = (theme) => {
  const section = {
    WebkitAppRegion: 'drag',
    display: 'flex',
    flexDirection: 'row',
  }

  return {
    container: {
      display: 'flex',
      flex: '1 1 auto',
      justifyContent: 'space-between',
    },
    leftSection: {
      ...section,
      justifyContent: 'flex-start',
      minWidth: 150,
    },
    centerSection: {
      ...section,
    },
    rightSection: {
      ...section,
      justifyContent: 'flex-end',
      minWidth: 150 + STOPLIGHT_BUTTONS_WIDTH,
    },
    buttonGroupSeparator: {
      width: 7,
    },
  }
}

@StylesEnhancer(stylesCreator)
class WorkspaceToolbar extends Component {

  state = {}

  openDiscuss = () => {
    shell.openExternal("https://decoslack.slack.com/messages/deco/")
  }

  openDocs = () => {
    shell.openExternal("https://www.decosoftware.com/docs")
  }

  openCreateDiscussAccount = () => {
    shell.openExternal("https://decoslackin.herokuapp.com/")
  }

  launchSimulatorOfType = (simInfo, platform) => {
    if (this.props.packagerIsOff) {
      this.props.dispatch(runPackager())
    }
    this.props.dispatch(runSimulator(simInfo, platform))
    SimulatorUtils.didLaunchSimulator(simInfo, platform)
    if (OnboardingUtils.shouldOpenConsoleForFirstTime()) {
      this.props.dispatch(setConsoleVisibility(true))
      OnboardingUtils.didOpenConsoleForFirstTime()
    }
  }

  renderSimulatorMenu = () => {
    return (
      <SimulatorMenu
        setAndroidEmulationOption={(option) => {
          const value = option == 'AVD' ? false : true
          this.props.dispatch(setPreference(CATEGORIES.GENERAL, PREFERENCES.GENERAL.USE_GENYMOTION, value))
          this.props.dispatch(savePreferences())
          this.props.dispatch(getAvailableSimulators('android'))
        }}
        activeEmulationOption={this.props.useGenymotion ? 'Genymotion' : 'AVD'}
        setActiveList={(platform) => {
          this.props.dispatch(setSimulatorMenuPlatform(platform))
        }}
        active={this.props.simulatorMenuPlatform}
        checkAvailableSims={() => {
          // check to see if path changes or config changes open up new simulators
          this.props.dispatch(getAvailableSimulators('ios'))
          this.props.dispatch(getAvailableSimulators('android'))
        }}
        ios={this.props.availableSimulatorsIOS}
        android={this.props.availableSimulatorsAndroid}
        onClick={this.launchSimulatorOfType}
      />
    )
  }

  renderDropdownMenu = () => {
    const options = [
      { text: 'Open Deco Slack', action: this.openDiscuss },
      { text: 'Create Slack Account', action: this.openCreateDiscussAccount },
    ]

    return (
      <div className={'helvetica-smooth'}>
        {_.map(options, ({text, action}, i) => (
          <div key={i}
            style={{
              marginBottom: i === options.length - 1 ? 0 : 6,
              marginRight: 10,
              marginLeft: 10,
            }}>
            <LandingButton onClick={action}>
              {text}
            </LandingButton>
          </div>
        ))}
      </div>
    )
  }

  setDiscussMenuVisibility = (visible) => this.setState({discussMenuOpen: visible})

  reloadSimulator = () => this.props.dispatch(hardReloadSimulator())

  setSimulatorMenuVisibility = (visible) => this.setState({simulatorMenuOpen: visible})

  toggleLeftPane = () => {
    const {projectNavigatorVisible} = this.props

    this.props.dispatch(setLeftSidebarVisibility(!projectNavigatorVisible))
  }

  toggleBottomPane = () => {
    const {consoleVisible} = this.props

    this.props.dispatch(setConsoleVisibility(!consoleVisible))
  }


  toggleRightPane = (content) => {
    const {rightSidebarContent} = this.props

    const updated = rightSidebarContent === RIGHT_SIDEBAR_CONTENT.NONE ?
      RIGHT_SIDEBAR_CONTENT.PROPERTIES :
      RIGHT_SIDEBAR_CONTENT.NONE

    this.props.dispatch(setRightSidebarContent(updated))
  }

  renderLeftSection() {
    const {styles} = this.props

    return (
      <div style={styles.leftSection}>
        <ThemedToolbarButtonGroup>
          <ThemedToolbarButton
            text={'Docs'}
            onClick={this.openDocs}
          />
        </ThemedToolbarButtonGroup>
        <div style={styles.buttonGroupSeparator} />
        <ThemedToolbarButtonGroup>
          <DropdownMenuButton
            menuType={'platform'}
            offset={dropdownMenuOffset}
            onVisibilityChange={this.setDiscussMenuVisibility}
            renderContent={this.renderDropdownMenu}
          >
            <ThemedToolbarButton
              text={'Deco Slack'}
              opened={this.state.discussMenuOpen}
            />
          </DropdownMenuButton>
        </ThemedToolbarButtonGroup>
      </div>
    )
  }

  renderCenterSection() {
    const {styles, simulatorProjectActive} = this.props
    const {simulatorMenuOpen} = this.state

    return (
      <div style={styles.centerSection}>
        <ThemedToolbarButtonGroup>
          <DropdownMenuButton
            menuType={'platform'}
            offset={dropdownMenuOffset}
            onVisibilityChange={this.setSimulatorMenuVisibility}
            renderContent={this.renderSimulatorMenu}
          >
            <ThemedToolbarButton
              id={'simulator-btn'}
              active={simulatorProjectActive}
              icon={'phone'}
              groupPosition={'left'}
              opened={simulatorMenuOpen}
            />
          </DropdownMenuButton>
          <ThemedToolbarButton
            icon={'refresh'}
            onClick={this.reloadSimulator}
          />
        </ThemedToolbarButtonGroup>
      </div>
    )
  }

  renderRightSection() {
    const {styles, projectNavigatorVisible, consoleVisible, rightSidebarContent} = this.props

    return (
      <div style={styles.rightSection}>
        <ThemedToolbarButtonGroup>
          <ThemedToolbarButton
            icon={'left-pane'}
            active={projectNavigatorVisible}
            onClick={this.toggleLeftPane}
            minWidth={0}
          />
          <ThemedToolbarButton
            icon={'bottom-pane'}
            active={consoleVisible}
            onClick={this.toggleBottomPane}
            minWidth={0}
          />
          <ThemedToolbarButton
            icon={'right-pane'}
            active={rightSidebarContent !== RIGHT_SIDEBAR_CONTENT.NONE}
            onClick={this.toggleRightPane}
            minWidth={0}
          />
        </ThemedToolbarButtonGroup>
      </div>
    )
  }

  render() {
    const {styles} = this.props

    return (
      <ThemedToolbar>
        <div style={styles.container}>
          {this.renderLeftSection()}
          {this.renderCenterSection()}
          {this.renderRightSection()}
        </div>
      </ThemedToolbar>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    title: state.directory.rootName,
    consoleVisible: state.ui.consoleVisible,
    projectNavigatorVisible: state.ui[LAYOUT_FIELDS.LEFT_SIDEBAR_VISIBLE],
    rightSidebarContent: state.ui.rightSidebarContent,
    simulatorMenuPlatform: state.ui.simulatorMenuPlatform,
    packagerIsOff: state.application.packagerStatus == ProcessStatus.OFF,
    simulatorProjectActive: state.application.simulatorStatus == ProcessStatus.ON,
    availableSimulatorsIOS: state.application.availableSimulatorsIOS,
    availableSimulatorsAndroid: state.application.availableSimulatorsAndroid,
    useGenymotion: state.preferences[CATEGORIES.GENERAL][PREFERENCES.GENERAL.USE_GENYMOTION],
    publishingFeature: state.preferences[CATEGORIES.GENERAL][PREFERENCES.GENERAL.PUBLISHING_FEATURE]
  }
}

export default connect(mapStateToProps)(WorkspaceToolbar)
