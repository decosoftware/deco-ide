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

const { shell } = Electron

import _ from 'lodash'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { createSelector } from 'reselect'
import { StylesEnhancer } from 'react-styles-provider'
import { HotKeys } from 'react-hotkeys'
import path from 'path'

import * as selectors from '../selectors'
import * as uiActions from '../actions/uiActions'
import * as applicationActions from '../actions/applicationActions'
import * as textEditorCompositeActions from '../actions/textEditorCompositeActions'
import * as compositeFileActions from '../actions/compositeFileActions'
import { installAndStartFlow } from '../utils/FlowUtils'
import { PACKAGE_ERROR } from '../utils/PackageUtils'
import { CATEGORIES, METADATA, PREFERENCES } from 'shared/constants/PreferencesConstants'
import { CONTENT_PANES } from '../constants/LayoutConstants'
import TabSplitter from './TabSplitter'

import {
  ProgressBar,
  Console,
  SearchMenu,
  ComponentMenuItem,
  TabContainer,
  Tab,
  TabContent,
  EditorToast,
} from '../components'

const DEFAULT_NPM_REGISTRY = METADATA[CATEGORIES.EDITOR][PREFERENCES[CATEGORIES.EDITOR].NPM_REGISTRY].defaultValue
const CONSOLE_COLLAPSED_HEIGHT = 36
const CONSOLE_EXPANDED_HEIGHT = 300

const stylesCreator = ({colors}) => {
  const tabBarHeight = 36

  return {
    hotkeys: {
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      outline: 'none',
    },
    contentContainer: {
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
    },
    progressBar: {
      position: 'absolute',
      top: tabBarHeight + 10,
      left: 10,
      right: 10,
      height: 20,
      zIndex: 1000,
      opacity: 0.8,
    },
    link: {
      textDecoration: 'underline',
    },
    tabContainer: {
      flex: 1,
    },
  }
}

const emptyTabs = []

const mapStateToProps = (state) => createSelector(
  selectors.currentDoc,
  ({directory}) => directory.rootPath,
  selectors.componentList,
  ({ui}) => ({
    consoleVisible: ui.consoleVisible,
    savedScrollHeight: ui.scrollHeight,
    progressBar: ui.progressBar,
  }),
  ({application}) => ({
    packagerOutput: application.packagerOutput,
    packagerStatus: application.packagerStatus,
    configError: application.configError,
    flowError: application.flowError,
  }),
  ({metadata}) => metadata.liveValues.liveValuesById,
  ({preferences}) => ({
    npmRegistry: preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.NPM_REGISTRY],
  }),
  ({storyboard}) => ({
    showStoryboard: storyboard.shouldShow,
  }),
  (decoDoc, rootPath, componentList, ui, application, liveValuesById, preferences, storyboard) => ({
    decoDoc,
    rootPath,
    componentList,
    ...ui,
    ...application,
    liveValuesById,
    ...preferences,
    ...storyboard,
  })
)

@StylesEnhancer(stylesCreator)
class TabbedEditor extends Component {

  static propTypes = {
    consoleVisible: PropTypes.bool.isRequired,
    packagerOutput: PropTypes.string.isRequired,
    savedScrollHeight: PropTypes.number.isRequired,
  }

  static defaultProps = {
    style: {},
    className: '',
  }

  state = {
    showMenu: false,
    menuPosition: {x: 0, y: 0},
  }

  keyMap = {
    openInsertMenu: 'command+i',
  }

  keyHandlers = {
    openInsertMenu: (e) => {
      const {decoDoc} = this.props
      const {showMenu} = this.state

      if (decoDoc && !showMenu) {
        this.setState({
          showMenu: true,
          linkedDocId: decoDoc.getFocusedLinkedDoc().id
        })
      }
    }
  }

  calculatePositions() {
    const positionRect = this.refs.position.getBoundingClientRect()
    const width = positionRect.width - 144
    return {
      y: positionRect.top + 100,
      x: positionRect.left + (positionRect.width - width) / 2,
      width: width,
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const position = this.calculatePositions()
    if (!_.isEqual(this.state.menuPosition, position)) {
      this.setState({
        menuPosition: position,
      })
    }
  }

  onImportItem = (component) => {
    const {decoDoc} = this.props
    const {linkedDocId} = this.state

    if (!decoDoc) return


    this.props.dispatch(textEditorCompositeActions.insertComponent(decoDoc.id, linkedDocId, component))
  }

  onCloseConfigErrorToast = () => this.props.dispatch(applicationActions.clearConfigError())

  onCloseFlowErrorToast = () => this.props.dispatch(applicationActions.setFlowError(null))

  onInstallFlow = () => {
    const {rootPath, npmRegistry} = this.props

    this.props.dispatch(applicationActions.setFlowError(null))
    installAndStartFlow(rootPath, npmRegistry)
  }

  toggleConsole = () => {
    const {consoleVisible} = this.props

    this.props.dispatch(uiActions.setConsoleVisibility(!consoleVisible))
  }

  togglePackager = (isRunning) => {
    if (isRunning) {
      this.props.dispatch(applicationActions.stopPackager())
    } else {
      this.props.dispatch(applicationActions.runPackager())
    }
  }

  saveScrollHeight = (scrollHeight) => this.props.dispatch(uiActions.setConsoleScrollHeight(scrollHeight))

  // TODO: move search menu to top level and take care of this on that refactor
  onRequestCloseSearchMenu = () => {
    const {decoDoc} = this.props
    const {linkedDocId} = this.state

    if (decoDoc && linkedDocId) {
      const linkedDoc = decoDoc.findLinkedDocById(linkedDocId)
      const editor = linkedDoc && linkedDoc.getEditor()

      editor && editor.focus()
    }

    this.setState({showMenu: false})
  }

  renderFlowInstallationToast() {
    const {styles} = this.props

    return (
      <EditorToast
        type={'recommended'}
        buttonText={'Yes, install flow-bin into node_modules'}
        onClose={this.onCloseFlowErrorToast}
        onButtonClick={this.onInstallFlow}
        message={(
          <div>
            Use the Flow static type-checker{' '}
            <a
              style={styles.link}
              onClick={() => shell.openExternal("https://flowtype.org/")}
            >
              (https://flowtype.org/)
            </a>
            {' '}for enhanced autocompletion and prop detection? Many Deco features
            rely on Flow for static analysis of your project's code,
            so this is highly recommended.
          </div>
        )}
      />
    )
  }

  renderToast() {
    const {configError, flowError} = this.props

    if (configError !== '') {
      return (
        <EditorToast
          type={'error'}
          message={configError}
          onClose={this.onCloseConfigErrorToast}
        />
      )
    } else if (flowError && flowError.code === PACKAGE_ERROR.MISSING) {
      return this.renderFlowInstallationToast()
    } else {
      return null
    }
  }

  render() {
    const {
      styles,
      style,
      npmRegistry,
      width,
      height,
      decoDoc,
      liveValuesById,
      progressBar,
      componentList,
      consoleVisible,
      packagerOutput,
      packagerStatus,
      savedScrollHeight,
    } = this.props

    const {showMenu, menuPosition} = this.state

    // Show npm registry only if it's not the default
    const showNpmRegistry = npmRegistry && npmRegistry !== DEFAULT_NPM_REGISTRY

    const consoleHeight = consoleVisible ? CONSOLE_EXPANDED_HEIGHT : CONSOLE_COLLAPSED_HEIGHT

    return (
      <HotKeys
        handlers={this.keyHandlers}
        keyMap={this.keyMap}
        style={styles.hotkeys}
      >
        <div // this is used only for the ref - since a ref to hotkeys isn't a DOM node
          className={'vbox flex-variable full-size-relative'}
          id={'tabbed-editor'}
          ref={'position'}
          style={style}
        >
          {this.renderToast()}
          <div style={styles.contentContainer}>
            <TabSplitter
              style={styles.tabContainer}
              width={width}
              height={height - consoleHeight}
            />
          </div>
          <Console
            collapsedHeight={CONSOLE_COLLAPSED_HEIGHT}
            expandedHeight={CONSOLE_EXPANDED_HEIGHT}
            consoleOpen={consoleVisible}
            packagerOutput={packagerOutput}
            packagerStatus={packagerStatus}
            initialScrollHeight={savedScrollHeight}
            toggleConsole={this.toggleConsole}
            togglePackager={this.togglePackager}
            saveScrollHeight={this.saveScrollHeight}
          />
          {
            this.props.progressBar && (
              <ProgressBar
                style={styles.progressBar}
                name={`npm install ${progressBar.name}` +
                  (showNpmRegistry ? ` --registry=${npmRegistry}` : '')}
                progress={progressBar.progress}
              />
            )
          }
          <SearchMenu
            ItemComponent={ComponentMenuItem}
            items={componentList}
            onClickItem={this.onImportItem}
            show={showMenu}
            anchorPosition={menuPosition}
            requestClose={this.onRequestCloseSearchMenu}
          />
        </div>
      </HotKeys>
    )
  }
}

export default connect(mapStateToProps)(TabbedEditor)
