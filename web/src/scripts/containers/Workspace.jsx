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
import { bindActionCreators } from 'redux'
import { createSelector } from 'reselect'
import WorkspaceEnhancer from 'react-workspace'

import * as uiActions from '../actions/uiActions'
import { RIGHT_SIDEBAR_CONTENT, LAYOUT_FIELDS } from '../constants/LayoutConstants'
import { CATEGORIES, PREFERENCES } from 'shared/constants/PreferencesConstants'
import * as WindowSizeUtils from '../utils/WindowSizeUtils'
import WorkspaceToolbar from './WorkspaceToolbar'
import TabbedEditor from './TabbedEditor'
import LiveValueInspector from './LiveValueInspector'
import Publishing from './Publishing'
import ProjectNavigator from './ProjectNavigator'
import ComponentInspector from './ComponentInspector'
import ComponentBrowser from './ComponentBrowser'
import { Pane, InspectorPane } from '../components'
import { StylesEnhancer } from 'react-styles-provider'

const stylesCreator = (theme) => {
  const {colors} = theme

  return {
    container: {
      flex: 1,
      width: window.innerWidth,
      height: window.innerHeight,
    },
    toolbar: {
      flex: 0,
      height: 71,
    },
    content: {
      flex: 1,
      flexDirection: 'row',
      background: colors.background,
    },
    leftPane: {
      flex: 0,
      minWidth: 170,
      width: 290,
      maxWidth: 400,
    },
    leftPaneTop: {
      flex: 1,
    },
    leftPaneBottom: {
      flex: 0,
      minHeight: 100,
      height: 300,
      maxHeight: 600,
      borderTopWidth: 1,
      borderTopColor: colors.dividerInverted,
      borderTopStyle: 'solid',
    },
    rightPane: {
      flex: 0,
      minWidth: 170,
      width: 230,
      maxWidth: 400,
    },
    rightPaneInner: {
      flex: 1,
    },
    centerPane: {
      flex: 1,
    },
  }
}

const mapStateToProps = (state) => createSelector(
  ({editor: {openDocId, docCache}}) => openDocId ? docCache[openDocId] : null,
  ({ui}) => ({
    width: ui[LAYOUT_FIELDS.WINDOW_BOUNDS].width,
    height: ui[LAYOUT_FIELDS.WINDOW_BOUNDS].height,
  }),
  ({ui}) => ({
    projectNavigatorVisible: ui[LAYOUT_FIELDS.LEFT_SIDEBAR_VISIBLE],
    rightSidebarContent: ui[LAYOUT_FIELDS.RIGHT_SIDEBAR_CONTENT],
  }),
  ({preferences}) => preferences[CATEGORIES.GENERAL][PREFERENCES.GENERAL.PUBLISHING_FEATURE],
  (decoDoc, windowBounds, ui, publishingFeature) => ({
    decoDoc,
    ...windowBounds,
    ...ui,
    publishingFeature,
  })
)

const mapDispatchToProps = (dispatch) => ({
  uiActions: bindActionCreators(uiActions, dispatch),
})

class Workspace extends Component {

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
    const bounds = WindowSizeUtils.getSavedWindowBounds()
    this.props.uiActions.resizeWindow(bounds)
  }

  onResize = () => {
    const bounds = WindowSizeUtils.getCurrentWindowBounds()
    this.props.uiActions.setWindowSize(bounds)
    this.props.uiActions.saveWindowBounds()
  }

  renderInspector() {
    const {styles, decoDoc, rightSidebarContent, publishingFeature} = this.props

    switch (rightSidebarContent) {

      case RIGHT_SIDEBAR_CONTENT.NONE:
        return null

      case RIGHT_SIDEBAR_CONTENT.PROPERTIES:
        return publishingFeature ? (
          <ComponentInspector
            style={styles.rightPane}
            decoDoc={decoDoc}
          />
        ) : (
          <LiveValueInspector
            style={styles.rightPane}
            decoDoc={decoDoc}
          />
        )

      case RIGHT_SIDEBAR_CONTENT.PUBLISHING:
        return (
          <Publishing
            style={styles.rightPane}
            decoDoc={decoDoc}
          />
        )
    }
  }

  render() {
    const {styles, decoDoc, width, height, projectNavigatorVisible} = this.props

    const containerStyle = {
      ...styles.container,
      width: width || window.innerWidth,
      height: height || window.innerHeight,
    }

    return (
      <div style={containerStyle}>
        <WorkspaceToolbar
          style={styles.toolbar}
        />
        <div style={styles.content} data-resizable>
          {projectNavigatorVisible && (
            <div style={styles.leftPane} data-resizable>
              <ProjectNavigator
                className={'subpixel-antialiased helvetica-smooth'}
                style={styles.leftPaneTop}
              />
              <ComponentBrowser
                className={'subpixel-antialiased'}
                style={styles.leftPaneBottom}
              />
            </div>
          )}
          <TabbedEditor
            key={'tabbed-editor'}
            style={styles.centerPane}
            decoDoc={decoDoc}
          />
          {this.renderInspector()}
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(
  StylesEnhancer(stylesCreator)(WorkspaceEnhancer(Workspace, 'main-workspace')),
)
