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

import React, { Component, PropTypes, } from 'react'
import _ from 'lodash'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { createSelector } from 'reselect'
import WorkspaceEnhancer from 'react-workspace'

import { uiActions } from '../actions'
import { RIGHT_SIDEBAR_CONTENT, LAYOUT_FIELDS } from '../constants/LayoutConstants'
import { CATEGORIES, PREFERENCES } from 'shared/constants/PreferencesConstants'
import * as WindowSizeUtils from '../utils/WindowSizeUtils'
import WorkspaceToolbar from './WorkspaceToolbar'
import TabbedEditor from './TabbedEditor'
import LiveValueInspector from './LiveValueInspector'
import Publishing from './Publishing'
import ProjectNavigator from './ProjectNavigator'
import ComponentInspector from './ComponentInspector'
import { StylesEnhancer } from 'react-styles-provider'

const stylesCreator = ({colors}) => {
  return {
    container: {
      flex: 1,
      width: window.innerWidth,
      height: window.innerHeight,
    },
    toolbar: {
      flex: 0,
      height: 38,
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
    leftPaneInner: {
      flex: 1,
    },
    rightPaneTop: {
      flex: 1,
    },
    rightPaneBottom: {
      flex: 0,
      minHeight: 100,
      height: 300,
      maxHeight: 600,
      borderTopWidth: 1,
      borderTopColor: colors.dividerInverted,
      borderTopStyle: 'solid',
    },
    rightPaneBottomInner: {
      flex: 1,
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
      background: colors.editor.background,
    },
  }
}

const mapStateToProps = (state) => createSelector(
  ({ui}) => ({
    width: ui[LAYOUT_FIELDS.WINDOW_BOUNDS].width,
    height: ui[LAYOUT_FIELDS.WINDOW_BOUNDS].height,
  }),
  ({ui}) => ({
    projectNavigatorVisible: ui[LAYOUT_FIELDS.LEFT_SIDEBAR_VISIBLE],
    rightSidebarVisible: ui[LAYOUT_FIELDS.RIGHT_SIDEBAR_VISIBLE],
    rightSidebarContent: ui[LAYOUT_FIELDS.RIGHT_SIDEBAR_CONTENT],
  }),
  ({preferences}) => preferences[CATEGORIES.GENERAL][PREFERENCES.GENERAL.PUBLISHING_FEATURE],
  (windowBounds, ui, publishingFeature) => ({
    ...windowBounds,
    ...ui,
    publishingFeature,
  })
)

const mapDispatchToProps = (dispatch) => ({
  uiActions: bindActionCreators(uiActions, dispatch),
})

@connect(mapStateToProps, mapDispatchToProps)
@StylesEnhancer(stylesCreator)
@WorkspaceEnhancer('main-workspace')
export default class Workspace extends Component {

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
    const {styles, decoDoc, rightSidebarContent, rightSidebarVisible, publishingFeature} = this.props

    if (!rightSidebarVisible) return null

    if (publishingFeature) {

      switch (rightSidebarContent) {

        case RIGHT_SIDEBAR_CONTENT.PROPERTIES:
          return (
            <ComponentInspector
              style={styles.rightPane}
            />
          )

        case RIGHT_SIDEBAR_CONTENT.PUBLISHING:
          return (
            <Publishing
              style={styles.rightPane}
            />
          )
      }
    } else {
      return (
        <div style={styles.rightPane} data-resizable>
          <LiveValueInspector
            style={styles.rightPaneTop}
          />
          <div style={styles.rightPaneBottom}>
            <Publishing
              style={styles.rightPaneBottomInner}
            />
          </div>
        </div>
      )
    }
  }

  renderEditor = () => {
    const {styles} = this.props

    return (
      <TabbedEditor
        key={'tabbed-editor'}
        style={styles.centerPane}
      />
    )
  }

  render() {
    const {
      styles,
      decoDoc,
      width,
      height,
      projectNavigatorVisible,
    } = this.props

    const containerStyle = {
      ...styles.container,
      width: width || window.innerWidth,
      height: height || window.innerHeight,
      position: 'relative',
    }

    return (
      <div style={containerStyle}>
        <WorkspaceToolbar
          style={styles.toolbar}
        />
        <div style={styles.content} data-resizable>
          { projectNavigatorVisible && (
            <div style={styles.leftPane} data-resizable>
              <ProjectNavigator
                className={'subpixel-antialiased helvetica-smooth'}
                style={styles.leftPaneInner}
              />
            </div>
          )}
          { this.renderEditor() }
          { this.renderInspector() }
        </div>
      </div>
    )
  }
}
