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

import { HotKeys } from 'react-hotkeys'

import EditorDropTarget from '../components/editor/EditorDropTarget'
import HistoryMiddleware from '../middleware/editor/HistoryMiddleware'
import TokenMiddleware from '../middleware/editor/TokenMiddleware'
import DecoRangeMiddleware from '../middleware/editor/DecoRangeMiddleware'
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

import { setConsoleVisibility, setConsoleScrollHeight } from '../actions/uiActions'
import { importComponent, loadComponent } from '../actions/componentActions'
import { insertComponent, clearCurrentDoc, insertTemplate } from '../actions/editorActions'
import { fetchTemplateAndImportDependencies } from '../api/ModuleClient'
import { closeTab, clearFocusedTab } from '../actions/tabActions'
import { clearSelections } from '../actions/fileActions'
import { openFile } from '../actions/compositeFileActions'
import { getRootPath } from '../utils/PathUtils'
import { CATEGORIES, PREFERENCES } from '../constants/PreferencesConstants'
import { CONTENT_PANES } from '../constants/LayoutConstants'

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
        item.template.text,
        item.template.metadata,
        this.props.rootPath,
        this.props.npmRegistry,
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

    const editorClassName = 'flex-variable editor ' +
        (this.props.highlightLiteralTokens ? 'highlight' : '')

    return (
      <HotKeys handlers={this.keyHandlers} keyMap={this.keyMap}
        className={'vbox flex-variable full-size-relative'}
        style={{outline: 'none'}}>
        <div className={'vbox flex-variable full-size-relative'}
          ref='position'
          style={this.props.style}>
          <TabContainer style={tabBarStyle}
            focusedTabId={this.props.focusedTabId}
            onFocusTab={(tabId) => {
              this.props.dispatch(openFile(this.props.filesByTabId[tabId]))
            }}
            onCloseTab={(tabId, tabToFocus) => {
              this.props.dispatch(closeTab(CONTENT_PANES.CENTER, tabId))

              // If there's another tab to open, open the file for it
              if (tabToFocus) {
                this.props.dispatch(openFile(this.props.filesByTabId[tabToFocus]))
              } else {
                this.props.dispatch(clearFocusedTab(CONTENT_PANES.CENTER))
                this.props.dispatch(clearCurrentDoc())
                this.props.dispatch(clearSelections())
              }
            }}
            width={this.props.width}>
            {_.map(this.props.tabIds, (tabId) => {
              const filename = this.props.filesByTabId[tabId].module

              return (
                <Tab key={tabId}
                  title={filename}
                  tabId={tabId}>{filename}</Tab>
              )
            })}
          </TabContainer>
          {
            this.props.decoDoc ? (
              <EditorDropTarget className={editorClassName}
                ref='editor'
                middleware={[
                  DragAndDropMiddleware(this.props.dispatch),
                  DecoRangeMiddleware(this.props.dispatch),
                  HistoryMiddleware(this.props.dispatch),
                  TokenMiddleware(this.props.dispatch),
                  ClipboardMiddleware(this.props.dispatch, this.props.liveValuesById),
                  AutocompleteMiddleware(this.props.dispatch),
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
            initialScrollHeight={this.props.savedScrollHeight}
            toggleConsole={() => {
              this.props.dispatch(setConsoleVisibility(!this.props.consoleVisible))
            }}
            saveScrollHeight={(scrollHeight) => {
              this.props.dispatch(setConsoleScrollHeight(scrollHeight))
            }}/>
          {
            this.props.progressBar && (
              <ProgressBar
                style={progressBarStyle}
                name={`npm install ${this.props.progressBar.name}` +
                      (this.props.npmRegistry? ` --registry=${this.props.npmRegistry}`: '')}
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
    savedScrollHeight: state.ui.scrollHeight,
    liveValuesById: state.metadata.liveValues.liveValuesById,
    focusedTabId: _.get(state, `ui.tabs.${CONTENT_PANES.CENTER}.focusedTabId`),
    tabIds,
    filesByTabId,
    progressBar: state.ui.progressBar,
    rootPath: getRootPath(state),
    npmRegistry: state.preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.NPM_REGISTRY],
    options: {
      keyMap: state.preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.VIM_MODE] ? 'vim' : 'sublime',
      showInvisibles: state.preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.SHOW_INVISIBLES],
      styleActiveLine: state.preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.HIGHLIGHT_ACTIVE_LINE],
      showIndentGuides: state.preferences[CATEGORIES.EDITOR][PREFERENCES.EDITOR.SHOW_INDENT_GUIDES],
    }
  }
}

export default connect(mapStateToProps)(TabbedEditor)
