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

import * as ContentLoader from '../api/ContentLoader'
import * as selectors from '../selectors'
import FileTreeActions from '../filetree/actions'
import { tabActions } from '../actions'
import * as compositeFileActions from '../actions/compositeFileActions'
import { TabContainer, Tab, TabContent } from '../components'

const stylesCreator = ({colors}, {style}) => ({
  container: {
    position: 'relative',
    ...style,
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
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    borderWidth: 1,
    borderTopWidth: 0,
    borderStyle: 'solid',
    borderColor: colors.editor.divider,
    backgroundColor: colors.editor.background,
  },
})

const emptyTabs = []

const mapStateToProps = (state, props) => createSelector(
  (state, {tabGroup}) => tabGroup && ({
    focusedTabId: tabGroup.focusedTabId,
    tabIds: tabGroup.tabIds,
  }),
  selectors.filesByTabId,
  (tabGroup, filesByTabId) => ({
    ...tabGroup,
    filesByTabId,
  })
)

@StylesEnhancer(stylesCreator, ({style}) => ({style}))
class TabPane extends Component {

  onFocusTab = (tabId) => {
    const {filesByTabId, tabGroupIndex, tabContainerId} = this.props
    const file = filesByTabId[tabId]

    if (file) {
      FileTreeActions.selectFile(file.path)
    }

    this.props.dispatch(tabActions.focusTab(tabContainerId, tabId, tabGroupIndex))
  }

  onCloseTab = (tabId) => {
    const {tabGroupIndex} = this.props

    this.props.dispatch(compositeFileActions.closeTabWindow(tabId, tabGroupIndex))
  }

  renderTabs() {
    const {tabIds = []} = this.props

    return tabIds.map((tabId) => {
      const name = ContentLoader.getResourceName(tabId)

      return (
        <Tab
          key={tabId}
          title={name}
          tabId={tabId}
        >
          {name}
        </Tab>
      )
    })
  }

  render() {
    const {styles, focusedTabId, width, tabContainerId, tabGroupIndex} = this.props

    return (
      <div style={styles.container}>
        <TabContainer
          style={styles.tabContainer}
          focusedTabId={focusedTabId}
          onFocusTab={this.onFocusTab}
          onCloseTab={this.onCloseTab}
          width={width}
        >
          {this.renderTabs()}
        </TabContainer>
        <div style={styles.contentContainer}>
          <TabContent
            uri={focusedTabId}
            tabContainerId={tabContainerId}
            tabGroupIndex={tabGroupIndex}
          />
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps)(TabPane)
