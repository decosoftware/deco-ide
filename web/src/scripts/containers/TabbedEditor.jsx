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
import NoContent from '../components/display/NoContent'
import ProgressBar from '../components/display/ProgressBar'
import Console from '../components/console/Console'
import SearchMenu from '../components/menu/SearchMenu'
import ComponentMenuItem from '../components/menu/ComponentMenuItem'
import TabContainer from '../components/layout/TabContainer'
import Tab from '../components/buttons/Tab'
import EditorToast from '../components/editor/EditorToast'

import { setConsoleVisibility, setConsoleScrollHeight } from '../actions/uiActions'
import { stopPackager, runPackager, clearConfigError, setFlowError } from '../actions/applicationActions'
import { importComponent, loadComponent } from '../actions/componentActions'
import { insertComponent, insertTemplate } from '../actions/editorActions'
import { closeTabWindow } from '../actions/compositeFileActions'
import { fetchTemplateAndImportDependencies } from '../api/ModuleClient'
import { openFile } from '../actions/compositeFileActions'
import { getRootPath } from '../utils/PathUtils'
import { installAndStartFlow } from '../utils/FlowUtils'
import { PACKAGE_ERROR } from '../utils/PackageUtils'
import { CATEGORIES, METADATA, PREFERENCES } from 'shared/constants/PreferencesConstants'
import { CONTENT_PANES } from '../constants/LayoutConstants'

const DEFAULT_NPM_REGISTRY = METADATA[CATEGORIES.EDITOR][PREFERENCES[CATEGORIES.EDITOR].NPM_REGISTRY].defaultValue

class TabbedEditor extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showMenu: false,
      menuPosition: {
        x: 0,
        y: 0,
      },
    }
    this.keyMap = {
      openInsertMenu: 'command+i',
    }
    this.keyHandlers = {
      openInsertMenu: (e) => {
        if (!this.state.showMenu) {
          this.setState({
            showMenu: true,
          })
        }
      }
    }
  }

  _calculatePositions() {
    const positionRect = ReactDOM.findDOMNode(this.refs.position).getBoundingClientRect()
    const width = positionRect.width - 144
    return {
      y: positionRect.top + 100,
      x: positionRect.left + (positionRect.width - width) / 2,
      width: width,
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const position = this._calculatePositions()
    if (!_.isEqual(this.state.menuPosition, position)) {
      this.setState({
        menuPosition: position,
      })
    }
  }

  onImportItem(item) {
    const {options} = this.props
    this.props.dispatch(importComponent(item)).then((payload) => {
      fetchTemplateAndImportDependencies(
        item.dependencies,
        item.template && item.template.text,
        item.template && item.template.metadata,
        this.props.rootPath,
        this.props.npmRegistry,
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
    })
  }

  renderFlowInstallationToast() {
    const linkStyle = {
      textDecoration: 'underline',
    }

    return (
      <EditorToast
        type={'recommended'}
        buttonText={'Yes, install flow-bin into node_modules'}
        message={(
          <div>
            Use the Flow static type-checker{' '}
            <a
              style={linkStyle}
              onClick={() => shell.openExternal("https://flowtype.org/")}
            >
              (https://flowtype.org/)
            </a>
            {' '}for enhanced autocompletion and prop detection? Many Deco features
            rely on Flow for static analysis of your project's code,
            so this is highly recommended.
          </div>
        )}
        onClose={() => {
          this.props.dispatch(setFlowError(null))
        }}
        onButtonClick={() => {
          const {rootPath, npmRegistry} = this.props

          this.props.dispatch(setFlowError(null))
          installAndStartFlow(rootPath, npmRegistry)
        }}
      />
    )
  }

  render() {
    const tabBarHeight = 32

    const editorStyle = {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      position: 'relative',
      overflow: 'auto',
    }

    const tabBarStyle = {
      height: tabBarHeight,
      backgroundColor: 'rgb(27,28,29)',
      borderBottom: '1px solid rgb(16,16,16)',
      fontSize: 11,
      lineHeight: `${tabBarHeight}px`,
      letterSpacing: 0.3,
      fontFamily: "'Helvetica Neue', Helvetica, sans-serif",
    }

    const progressBarStyle = {
      position: 'absolute',
      top: tabBarHeight + 10,
      left: 10,
      right: 10,
      height: 20,
      zIndex: 1000,
      opacity: 0.8,
    }

    const editorClassName = 'flex-variable editor'

    // Show npm registry only if it's not the default
    const showNpmRegistry = this.props.npmRegistry && this.props.npmRegistry !== DEFAULT_NPM_REGISTRY
    const conditionallyRenderToast = () => {
      if (this.props.configError != '') {
        return (
          <EditorToast
            type={'error'}
            message={this.props.configError}
            onClose={() => {
              this.props.dispatch(clearConfigError())
            }}
          />
        )
      } else if (this.props.flowError && this.props.flowError.code === PACKAGE_ERROR.MISSING) {
        return this.renderFlowInstallationToast()
      } else {
        return null
      }
    }

    return (
      <HotKeys handlers={this.keyHandlers} keyMap={this.keyMap}
        className={'vbox flex-variable full-size-relative'}
        style={{outline: 'none'}}>
        <div className={'vbox flex-variable full-size-relative'}
          id={'tabbed-editor'}
          ref='position'
          style={this.props.style}>
          <TabContainer style={tabBarStyle}
            focusedTabId={this.props.focusedTabId}
            onFocusTab={(tabId) => {
              this.props.dispatch(openFile(this.props.filesByTabId[tabId].path))
            }}
            onCloseTab={(tabId) => {
              this.props.dispatch(closeTabWindow(tabId))
            }}
            width={this.props.width}>
            {_.map(this.props.tabIds, (tabId) => {
              const filename = path.basename(tabId)

              return (
                <Tab key={tabId}
                  title={filename}
                  tabId={tabId}>{filename}</Tab>
              )
            })}
          </TabContainer>
          {conditionallyRenderToast()}
          {
            this.props.decoDoc ? (
              <EditorDropTarget
                className={editorClassName}
                ref='editor'
                middleware={[
                  DragAndDropMiddleware(this.props.dispatch),
                  HistoryMiddleware(this.props.dispatch),
                  TokenMiddleware(this.props.dispatch),
                  ClipboardMiddleware(this.props.dispatch, this.props.liveValuesById),
                  AutocompleteMiddleware(this.props.dispatch, this.props.focusedTabId),
                  IndentGuideMiddleware(this.props.dispatch),
                ]}
                onImportItem={this.onImportItem.bind(this)}
                options={this.props.options}
                decoDoc={this.props.decoDoc}
                style={editorStyle} />
            ) : (
              <NoContent
                theme={NoContent.THEME.DARK}>
                  Welcome to Deco
                  <br />
                  <br />
                  Open a file in the Project Browser on the left to get started.
                </NoContent>
            )
          }
          <Console consoleOpen={this.props.consoleVisible}
            packagerOutput={this.props.packagerOutput}
            packagerStatus={this.props.packagerStatus}
            initialScrollHeight={this.props.savedScrollHeight}
            toggleConsole={() => {
              this.props.dispatch(setConsoleVisibility(!this.props.consoleVisible))
            }}
            togglePackager={(isRunning) => {
              if (isRunning) {
                this.props.dispatch(stopPackager())
              } else {
                this.props.dispatch(runPackager())
              }
            }}
            saveScrollHeight={(scrollHeight) => {
              this.props.dispatch(setConsoleScrollHeight(scrollHeight))
            }}/>
          {
            this.props.progressBar && (
              <ProgressBar
                style={progressBarStyle}
                name={`npm install ${this.props.progressBar.name}` +
                      (showNpmRegistry ? ` --registry=${this.props.npmRegistry}` : '')}
                progress={this.props.progressBar.progress} />
            )
          }
          <SearchMenu
            items={this.props.componentList}
            renderItem={(item, i) => {
              return (
                <ComponentMenuItem
                  name={item.name}
                  author={item.publisher}
                  description={item.description}
                  badges={item.tags || []}
                  image={item.thumbnail}
                  index={i} />
              )
            }}
            onItemClick={this.onImportItem.bind(this)}
            show={this.state.showMenu}
            anchorPosition={this.state.menuPosition}
            requestClose={() => {
                //delay allows key events to finish first?
                //TODO: move search menu to top level and take care of this on that refactor
                setTimeout(() => {
                  this.refs.editor.getDecoratedComponentInstance().focus()
                }, 200)
                this.setState({
                  showMenu: false,
                })
              }
            }/>
        </div>
      </HotKeys>
    )
  }
}

TabbedEditor.defaultProps = {
  style: {},
  className: '',
}

TabbedEditor.propTypes = {
  consoleVisible: PropTypes.bool.isRequired,
  packagerOutput: PropTypes.string.isRequired,
  savedScrollHeight: PropTypes.number.isRequired,
  highlightLiteralTokens: PropTypes.bool.isRequired,
}

const mapStateToProps = (state, ownProps) => {
  const tabIds = _.get(state, `ui.tabs.${CONTENT_PANES.CENTER}.tabIds`, [])
  const filesByTabId = {}
  _.each(tabIds, (tabId) => {
    filesByTabId[tabId] = state.directory.filesById[tabId] || {}
  })

  return {
    module: module,
    projectRoot: state.directory.rootPath,
    componentList: state.modules.modules,
    consoleVisible: state.ui.consoleVisible,
    packagerOutput: state.application.packagerOutput,
    packagerStatus: state.application.packagerStatus,
    savedScrollHeight: state.ui.scrollHeight,
    liveValuesById: state.metadata.liveValues.liveValuesById,
    focusedTabId: _.get(state, `ui.tabs.${CONTENT_PANES.CENTER}.focusedTabId`),
    tabIds,
    filesByTabId,
    progressBar: state.ui.progressBar,
    rootPath: getRootPath(state),
    npmRegistry: state.preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.NPM_REGISTRY],
    configError: state.application.configError,
    flowError: state.application.flowError,
    options: {
      keyMap: state.preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.VIM_MODE] ? 'vim' : 'sublime',
      showInvisibles: state.preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.SHOW_INVISIBLES],
      styleActiveLine: state.preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.HIGHLIGHT_ACTIVE_LINE],
      showIndentGuides: state.preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.SHOW_INDENT_GUIDES],
    }
  }
}

export default connect(mapStateToProps)(TabbedEditor)
