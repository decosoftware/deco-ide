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
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { StylesEnhancer } from 'react-styles-provider'
import { AutoSizer } from 'react-virtualized'
import path from 'path'

import * as selectors from '../selectors'
import * as compositeFileActions from '../actions/compositeFileActions'
import { CONTENT_PANES } from '../constants/LayoutConstants'
import TabPane from './TabPane'

import {
  ProgressBar,
  Console,
  SearchMenu,
  ComponentMenuItem,
  TabContainer,
  Tab,
  TabContent,
  EditorToast,
  Splitter,
} from '../components'

const stylesCreator = ({colors}) => ({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    display: 'flex',
  },
  pane: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    position: 'relative',
    display: 'flex',
  },
  tabContainer: {
    height: 36,
    borderBottom: '1px solid rgb(16,16,16)',
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
    backgroundColor: colors.editor.background,
  },
})

const emptyTabs = []

const mapStateToProps = (state) => createSelector(
  selectors.filesByTabId,
  selectors.focusedTabId,
  selectors.tabIds,
  (filesByTabId, focusedTabId, tabIds) => ({
    filesByTabId,
    focusedTabId,
    tabIds,
  })
)

@StylesEnhancer(stylesCreator)
class TabSplitter extends Component {
  render() {
    const {styles, style, width, height} = this.props

    return (
      <div style={style}>
        <Splitter
          width={width}
          height={height}
          workspaceId={'tab-splitter'}
        >
          <TabPane />
        </Splitter>
      </div>
    )
  }
}

export default connect(mapStateToProps)(TabSplitter)
