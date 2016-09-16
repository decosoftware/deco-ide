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
import React, { Component, PropTypes } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'

const { shell, remote } = Electron
const path = remote.require('path')

import { HotKeys } from 'react-hotkeys'

import EditorDropTarget from '../components/editor/EditorDropTarget'
import HistoryMiddleware from '../middleware/editor/HistoryMiddleware'
import TokenMiddleware from '../middleware/editor/TokenMiddleware'
import ClipboardMiddleware from '../middleware/editor/ClipboardMiddleware'
import AutocompleteMiddleware from '../middleware/editor/AutocompleteMiddleware'
import IndentGuideMiddleware from '../middleware/editor/IndentGuideMiddleware'
import DragAndDropMiddleware from '../middleware/editor/DragAndDropMiddleware'
import ASTMiddleware from '../middleware/editor/ASTMiddleware'
import NoContent from '../components/display/NoContent'
import ProgressBar from '../components/display/ProgressBar'
import Console from '../components/console/Console'
import SearchMenu from '../components/menu/SearchMenu'
import ComponentMenuItem from '../components/menu/ComponentMenuItem'
import TabContainer from '../components/layout/TabContainer'
import Tab from '../components/buttons/Tab'
import EditorToast from '../components/editor/EditorToast'
import { StylesEnhancer } from 'react-styles-provider'

import { setConsoleVisibility, setConsoleScrollHeight } from '../actions/uiActions'
import { stopPackager, runPackager, clearConfigError, setFlowError } from '../actions/applicationActions'
import { insertComponent, insertTemplate } from '../actions/editorActions'
import { closeTabWindow } from '../actions/compositeFileActions'
import { fetchTemplateAndImportDependencies } from '../api/ModuleClient'
import { openFile } from '../actions/compositeFileActions'
import { installAndStartFlow } from '../utils/FlowUtils'
import { PACKAGE_ERROR } from '../utils/PackageUtils'
import { CATEGORIES, METADATA, PREFERENCES } from 'shared/constants/PreferencesConstants'
import { CONTENT_PANES } from '../constants/LayoutConstants'

const DEFAULT_NPM_REGISTRY = METADATA[CATEGORIES.EDITOR][PREFERENCES[CATEGORIES.EDITOR].NPM_REGISTRY].defaultValue

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
      borderWidth: 1,
      borderTopWidth: 0,
      borderStyle: 'solid',
      borderColor: colors.editor.divider,
    },
    editor: {
      flex: '1 1 auto',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      position: 'relative',
      overflow: 'auto',
    },
    tabContainer: {
      height: tabBarHeight,
      borderBottom: '1px solid rgb(16,16,16)',
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
  }
}

const mapStateToProps = (state, ownProps) => {
  const tabIds = _.get(state, `ui.tabs.${CONTENT_PANES.CENTER}.tabIds`, [])
  const filesByTabId = {}
  _.each(tabIds, (tabId) => {
    filesByTabId[tabId] = state.directory.filesById[tabId] || {}
  })

  const publishingFeature = state.preferences[CATEGORIES.GENERAL][PREFERENCES.GENERAL.PUBLISHING_FEATURE]

  return {
    module: module,
    rootPath: state.directory.rootPath,
    componentList: publishingFeature ? state.components.list : state.modules.modules,
    consoleVisible: state.ui.consoleVisible,
    packagerOutput: state.application.packagerOutput,
    packagerStatus: state.application.packagerStatus,
    savedScrollHeight: state.ui.scrollHeight,
    liveValuesById: state.metadata.liveValues.liveValuesById,
    focusedTabId: _.get(state, `ui.tabs.${CONTENT_PANES.CENTER}.focusedTabId`),
    tabIds,
    filesByTabId,
    progressBar: state.ui.progressBar,
    npmRegistry: state.preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.NPM_REGISTRY],
    publishingFeature,
    configError: state.application.configError,
    flowError: state.application.flowError,
    options: {
      theme: state.preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.THEME],
      fontSize: state.preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.FONT_SIZE],
      keyMap: state.preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.VIM_MODE] ? 'vim' : 'sublime',
      showInvisibles: state.preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.SHOW_INVISIBLES],
      styleActiveLine: state.preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.HIGHLIGHT_ACTIVE_LINE],
      showIndentGuides: state.preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.SHOW_INDENT_GUIDES],
    }
  }
}

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
      const {showMenu} = this.state

      if (!showMenu) {
        this.setState({showMenu: true})
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

  onImportItem = (item) => {
    const {options, rootPath, npmRegistry} = this.props

    fetchTemplateAndImportDependencies(
      item.dependencies,
      item.template && item.template.text,
      item.template && item.template.metadata,
      rootPath,
      npmRegistry,
      item
    ).then(({text, metadata}) => {
      const {decoDoc} = this.props

      if (! decoDoc) {
        return
      }

      this.props.dispatch(insertTemplate(
        decoDoc,
        text,
        metadata,
        item.imports,
        _.get(item, 'inspector.group')
      ))
    })
  }

  onFocusTab = (tabId) => this.props.dispatch(openFile(this.props.filesByTabId[tabId].path))

  onCloseTab = (tabId) => this.props.dispatch(closeTabWindow(tabId))

  onCloseConfigErrorToast = () => this.props.dispatch(clearConfigError())

  onCloseFlowErrorToast = () => this.props.dispatch(setFlowError(null))

  onInstallFlow = () => {
    const {rootPath, npmRegistry} = this.props

    this.props.dispatch(setFlowError(null))
    installAndStartFlow(rootPath, npmRegistry)
  }

  toggleConsole = () => {
    const {consoleVisible} = this.props

    this.props.dispatch(setConsoleVisibility(!consoleVisible))
  }

  togglePackager = (isRunning) => {
    if (isRunning) {
      this.props.dispatch(stopPackager())
    } else {
      this.props.dispatch(runPackager())
    }
  }

  saveScrollHeight = (scrollHeight) => this.props.dispatch(setConsoleScrollHeight(scrollHeight))

  // Delay allows key events to finish first?
  // TODO: move search menu to top level and take care of this on that refactor
  onRequestCloseSearchMenu = () => {
    setTimeout(() => {
      this.refs.editor.getDecoratedComponentInstance().focus()
    }, 200)

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

  renderTabs() {
    const {tabIds} = this.props

    return tabIds.map((tabId) => {
      const filename = path.basename(tabId)

      return (
        <Tab
          key={tabId}
          title={filename}
          tabId={tabId}>{filename}
        </Tab>
      )
    })
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
      focusedTabId,
      width,
      options,
      decoDoc,
      liveValuesById,
      publishingFeature,
      progressBar,
      componentList,
    } = this.props

    const {showMenu, menuPosition} = this.state

    // Show npm registry only if it's not the default
    const showNpmRegistry = npmRegistry && npmRegistry !== DEFAULT_NPM_REGISTRY

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
          <TabContainer
            style={styles.tabContainer}
            focusedTabId={focusedTabId}
            onFocusTab={this.onFocusTab}
            onCloseTab={this.onCloseTab}
            width={width}
          >
            {this.renderTabs()}
          </TabContainer>
          {this.renderToast()}
          <div style={styles.contentContainer}>
            {decoDoc ? (
              <EditorDropTarget
                className={'flex-variable editor'}
                ref={'editor'}
                middleware={[
                  DragAndDropMiddleware(this.props.dispatch),
                  HistoryMiddleware(this.props.dispatch),
                  TokenMiddleware(this.props.dispatch),
                  ClipboardMiddleware(this.props.dispatch, liveValuesById),
                  AutocompleteMiddleware(this.props.dispatch, focusedTabId),
                  IndentGuideMiddleware(this.props.dispatch),
                  ASTMiddleware(this.props.dispatch, focusedTabId, publishingFeature),
                ]}
                onImportItem={this.onImportItem}
                options={options}
                decoDoc={decoDoc}
                style={styles.editor}
              />
            ) : (
              <NoContent>
                Welcome to Deco
                <br />
                <br />
                Open a file in the Project Browser on the left to get started.
              </NoContent>
            )}
          </div>
          <Console
            consoleOpen={this.props.consoleVisible}
            packagerOutput={this.props.packagerOutput}
            packagerStatus={this.props.packagerStatus}
            initialScrollHeight={this.props.savedScrollHeight}
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
            onItemClick={this.onImportItem.bind(this)}
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
