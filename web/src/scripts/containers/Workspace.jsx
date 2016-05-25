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
import { connect } from 'react-redux'

import {
  resizeWindow,
  setWindowSize,
  setRightSidebarWidth,
  setLeftSidebarWidth,
  setLeftSidebarBottomSectionHeight,
  saveWindowBounds,
} from '../actions/uiActions'
import { RIGHT_SIDEBAR_CONTENT, LAYOUT_FIELDS, LAYOUT_KEY } from '../constants/LayoutConstants'
import LocalStorage from '../persistence/LocalStorage'

import WorkspaceToolbar from './WorkspaceToolbar'
import TabbedEditor from './TabbedEditor'
import LiveValueInspector from './LiveValueInspector'
import PublishingInspector from './PublishingInspector'
import ProjectNavigator from './ProjectNavigator'
import ComponentBrowser from './ComponentBrowser'
import Pane from '../components/layout/Pane'

class Workspace extends Component {
  constructor(props) {
    super(props)

    this.onResize = this.onResize.bind(this)
  }

  componentWillMount() {
    this.resize()
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize)
  }

  resize() {

    // Retrieve stored window bounds
    const data = LocalStorage.loadObject(LAYOUT_KEY)

    // Always set (x, y) to (0, 0) for now
    // TODO: Handle window move event, store (x, y) to LocalStorage
    let windowBounds = {
      x: 0,
      y: 0,
    }

    // If window bounds exist, restore them
    if (data[LAYOUT_FIELDS.WINDOW_BOUNDS]) {
      const {width, height} = data[LAYOUT_FIELDS.WINDOW_BOUNDS]

      // Don't make the window larger than the screen
      windowBounds.width = Math.min(width, window.screen.availWidth)
      windowBounds.height = Math.min(height, window.screen.availHeight)

    // Else, set to default bounds
    } else {
      windowBounds.width = window.screen.availWidth * 3 / 4
      windowBounds.height = window.screen.availHeight
    }

    this.props.dispatch(resizeWindow(windowBounds))
  }

  onResize() {
    this.props.dispatch(setWindowSize({
      x: window.screenX,
      y: window.screenY,
      width: window.innerWidth,
      height: window.innerHeight,
    }))
    this.props.dispatch(saveWindowBounds())
  }

  renderInspector(rightPaneStyle) {
    let content = null

    switch (this.props.rightSidebarContent) {
      case RIGHT_SIDEBAR_CONTENT.PROPERTIES:
        content = (
          <LiveValueInspector
            width={this.props.rightSidebarWidth}
            decoDoc={this.props.decoDoc} />
        )
      break
      case RIGHT_SIDEBAR_CONTENT.PUBLISHING:
        content = (
          <PublishingInspector
            width={this.props.rightSidebarWidth}
            decoDoc={this.props.decoDoc} />
        )
      break
    }

    return (
      this.props.rightSidebarContent !== RIGHT_SIDEBAR_CONTENT.NONE && (
        <Pane
          className='subpixel-antialiased inspector'
          style={rightPaneStyle}
          size={this.props.rightSidebarWidth}
          min={170}
          max={400}
          resizableEdge={Pane.RESIZABLE_EDGE.LEFT}
          onResize={(value) => {
            this.props.dispatch(setRightSidebarWidth(value))
          }}>
          {content}
        </Pane>
      )
    )
  }

  render() {
    const {
      toolbarHeight,
      toolbarStyle,
      containerStyle,
      leftPaneStyle,
      rightPaneStyle,
      centerPaneStyle,
      leftPaneBottomSectionStyle,
      leftPaneBottomSectionContainerStyle,
      projectNavigatorStyle,
    } = getStyles(this.props)

    const {
      leftSidebarBottomSectionHeight,
    } = this.props

    return (
      <div className='vbox full-size-relative' style={{overflow: 'hidden',}}>
        <WorkspaceToolbar className='toolbar'
          height={toolbarHeight}
          title={this.props.directory.rootName} />
        <div className='flex-variable hbox' style={containerStyle}>
          {
            this.props.projectNavigatorVisible && (
              <Pane
                className='flex-fixed vbox'
                style={leftPaneStyle}
                size={this.props.leftSidebarWidth}
                min={170}
                max={400}
                resizableEdge={Pane.RESIZABLE_EDGE.RIGHT}
                onResize={(value) => {
                  this.props.dispatch(setLeftSidebarWidth(value))
                }}>
                <ProjectNavigator className={'subpixel-antialiased helvetica-smooth full-size-relative'}
                  style={projectNavigatorStyle}
                  tree={this.props.directory.tree}
                  rootName={this.props.directory.rootName || ''}
                  selectedIds={this.props.directory.selected} />
                <div
                  style={leftPaneBottomSectionContainerStyle}>
                  <Pane
                    style={leftPaneBottomSectionStyle}
                    size={leftSidebarBottomSectionHeight}
                    min={100}
                    max={600}
                    resizableEdge={Pane.RESIZABLE_EDGE.TOP}
                    onResize={(value) => {
                      this.props.dispatch(setLeftSidebarBottomSectionHeight(value))
                    }}>
                    <ComponentBrowser
                      className={'subpixel-antialiased'}
                      width={this.props.leftSidebarWidth}
                      height={leftSidebarBottomSectionHeight}
                    />
                  </Pane>
                </div>
              </Pane>
            )
          }
          <TabbedEditor className='flex-variable'
            width={this.props.centerPaneWidth}
            highlightLiteralTokens={this.props.highlightLiteralTokens}
            style={centerPaneStyle}
            decoDoc={this.props.decoDoc} />
          {this.renderInspector(rightPaneStyle)}
        </div>
      </div>
    )
  }
}

function getStyles(props) {
  const {
    leftSidebarBottomSectionHeight,
  } = props
  const toolbarHeight = 71
  const fixedHeightStyle = {
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  }
  return {
    toolbarHeight: toolbarHeight,
    containerStyle: {
      height: `calc(100% - ${toolbarHeight}px)`,
      overflow: 'hidden',
    },
    leftPaneStyle: _.extend({
      background: 'rgb(252,251,252)',
    }, fixedHeightStyle),
    centerPaneStyle: {
      position: 'absolute',
      left: 0,
      right: 0,
      overflow: 'hidden',
    },
    fixedHeightStyle: fixedHeightStyle,
    rightPaneStyle: _.extend({
      overflowY: 'auto',
      overflowX: 'hidden',
      background: 'rgb(252,251,252)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    }, fixedHeightStyle),
    leftPaneBottomSectionStyle: {
      position: 'absolute',
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
      width: '100%',
      height: '100%',
    },
    leftPaneBottomSectionContainerStyle: {
      borderTop: '1px solid rgb(224,224,224)',
      position: 'absolute',
      bottom: 0,
      height: leftSidebarBottomSectionHeight,
      width: '100%',
    },
    projectNavigatorStyle: {
      position: 'absolute',
      top: 0,
      height: `calc(100% - ${leftSidebarBottomSectionHeight}px)`,
      display: 'flex',
      flexDirection: 'column',
    },
  }
}

const mapStateToProps = (state, ownProps) => {
  let doc = null
  const docId = state.editor.openDocId
  const docCache = state.editor.docCache
  if (docId && docCache) {
    if (docCache[docId]) {
      doc = docCache[docId]
    }
  }

  const props = {
    directory: state.directory,
    decoDoc: doc,
    windowBounds: state.application[LAYOUT_FIELDS.WINDOW_BOUNDS],
    projectNavigatorVisible: state.ui[LAYOUT_FIELDS.LEFT_SIDEBAR_VISIBLE],
    rightSidebarContent: state.ui[LAYOUT_FIELDS.RIGHT_SIDEBAR_CONTENT],
    rightSidebarWidth: state.ui[LAYOUT_FIELDS.RIGHT_SIDEBAR_WIDTH],
    leftSidebarWidth: state.ui[LAYOUT_FIELDS.LEFT_SIDEBAR_WIDTH],
    leftSidebarBottomSectionHeight: state.ui[LAYOUT_FIELDS.LEFT_SIDEBAR_BOTTOM_SECTION_HEIGHT],
    isTemp: ownProps.location.query && ownProps.location.query.temp,
    highlightLiteralTokens: state.editor.highlightLiteralTokens,
  }

  props.centerPaneWidth = window.innerWidth -
      (props.rightSidebarContent !== RIGHT_SIDEBAR_CONTENT.NONE ? props.rightSidebarWidth : 0) -
      (props.projectNavigatorVisible ? props.leftSidebarWidth : 0)

  return props
}

export default connect(mapStateToProps)(Workspace)
