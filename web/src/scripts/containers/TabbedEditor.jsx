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

import * as URIUtils from '../utils/URIUtils'
import * as selectors from '../selectors'
import { installAndStartFlow } from '../utils/FlowUtils'
import { PACKAGE_ERROR } from '../utils/PackageUtils'
import { CATEGORIES, METADATA, PREFERENCES } from 'shared/constants/PreferencesConstants'
import { CONTENT_PANES } from '../constants/LayoutConstants'
import TabSplitter from './TabSplitter'
import { getTrackedFiles } from '../filetree'

import {
  uiActions,
  applicationActions,
  textEditorCompositeActions,
  compositeFileActions,
  tabActions,
} from '../actions'

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
const MENU_FILE_SEARCH = 'fileSearch'
const MENU_INSERT = 'insert'

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
  }),
  ({metadata}) => metadata.liveValues.liveValuesById,
  ({preferences}) => ({
    npmRegistry: preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.NPM_REGISTRY],
  }),
  selectors.tabContainerId,
  (decoDoc, rootPath, componentList, ui, application, liveValuesById, preferences, tabContainerId) => ({
    decoDoc,
    rootPath,
    componentList,
    ...ui,
    ...application,
    liveValuesById,
    ...preferences,
    tabContainerId,
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
    menu: null,
    menuPosition: {x: 0, y: 0},
  }

  keyMap = {
    openInsertMenu: 'command+i',

    // TODO consider also using command+t (which currently conflicts with a CM command)
    openFileSearch: 'command+p',
    focusNextTab: 'command+shift+]',
    focusPrevTab: 'command+shift+[',
    openInNewTab: 'command+shift+\\',
    focusNextGroup: 'command+k command+right',
    focusPrevGroup: 'command+k command+left',
  }

  keyHandlers = {
    openInsertMenu: (e) => this.props.decoDoc && this.openMenu(MENU_INSERT),
    openFileSearch: (e) => {
      const files = getTrackedFiles().map(node => ({
        node,
        name: node.path,
        displayName: `${node.name} - ${node.path}`,
      }))

      this.setState({files})
      this.openMenu(MENU_FILE_SEARCH)
    },
    focusNextGroup: (e) => this.props.dispatch(tabActions.focusAdjacentGroup(CONTENT_PANES.CENTER, 'next')),
    focusPrevGroup: (e) => this.props.dispatch(tabActions.focusAdjacentGroup(CONTENT_PANES.CENTER, 'prev')),
    focusNextTab: (e) => this.props.dispatch(tabActions.focusAdjacentTab(CONTENT_PANES.CENTER, 'next')),
    focusPrevTab: (e) => this.props.dispatch(tabActions.focusAdjacentTab(CONTENT_PANES.CENTER, 'prev')),
    openInNewTab: (e) => this.props.dispatch(tabActions.splitRight(CONTENT_PANES.CENTER)),
  }

  constructor(props) {
    super(props)

    for (let key = 1; key <= 9; key++) {
      const index = key - 1
      const focusTabHotkey = `focusTab${key}`
      const focusGroupHotkey = `focusGroup${key}`

      this.keyMap[focusTabHotkey] = `command+${key}`
      this.keyMap[focusGroupHotkey] = `command+k command+${key}`

      this.keyHandlers[focusTabHotkey] = this.focusTabByIndex.bind(this, index)
      this.keyHandlers[focusGroupHotkey] = this.focusGroupByIndex.bind(this, index)
    }
  }

  focusTabByIndex = (index) => this.props.dispatch(tabActions.focusTabByIndex(CONTENT_PANES.CENTER, index))

  focusGroupByIndex = (index) => this.props.dispatch(tabActions.focusGroup(CONTENT_PANES.CENTER, index))

  openMenu(menu) {
    const {decoDoc} = this.props

    // Return if this menu is already open
    if (menu === this.state.menu) return

    this.setState({
      menu,
      linkedDocId: decoDoc && decoDoc.getFocusedLinkedDoc().id
    })
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

  onOpenFile = ({node}) => {
    const {dispatch, tabContainerId} = this.props

    dispatch(tabActions.addTab(tabContainerId, URIUtils.filePathToURI(node.path)))
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

    this.setState({menu: null})
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
    const {configError} = this.props

    if (configError !== '') {
      return (
        <EditorToast
          type={'error'}
          message={configError}
          onClose={this.onCloseConfigErrorToast}
        />
      )
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

    const {menu, menuPosition, files} = this.state

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
            show={menu === MENU_INSERT}
            anchorPosition={menuPosition}
            requestClose={this.onRequestCloseSearchMenu}
          />
          <SearchMenu
            ItemComponent={ComponentMenuItem}
            items={files}
            onClickItem={this.onOpenFile}
            show={menu === MENU_FILE_SEARCH}
            anchorPosition={menuPosition}
            requestClose={this.onRequestCloseSearchMenu}
          />
        </div>
      </HotKeys>
    )
  }
}

export default connect(mapStateToProps)(TabbedEditor)
