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
import { StylesEnhancer } from 'react-styles-provider'

import TabUtils from '../../utils/TabUtils'

const TAB_CONTAINER_REF = 'container'

const stylesCreator = ({colors}) => ({
  inner: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    display: 'flex',
    backgroundColor: colors.tabs.background,
  },
  item: {
    flex: '0 0 150px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
    position: 'relative',
  }
})

@StylesEnhancer(stylesCreator)
export default class TabContainer extends Component {

  static defaultProps = {
    focusedTabId: null,
  }

  render() {
    const {styles} = this.props
    const count = React.Children.count(this.props.children) || 1
    const itemMax = this.props.width / count
    const itemWidth = Math.min(itemMax, 200)
    const tabIds = React.Children.map(this.props.children, (child) => child.props.tabId)

    const children = React.Children.map(this.props.children, (child, i) => {
      child = React.cloneElement(child, {
        onFocus: () => {
          this.props.onFocusTab(tabIds[i])
        },
        onClose: () => {
          this.props.onCloseTab(tabIds[i])
        },
        focused: tabIds[i] === this.props.focusedTabId,
      })

      const itemStyleSized = Object.assign({}, styles.item, {
        flex: `0 0 ${itemWidth}px`,
      })

      return (
        <div style={itemStyleSized}
          key={tabIds[i]}>
          {child}
        </div>
      )
    })

    return (
      <div style={this.props.style}>
        <div ref={TAB_CONTAINER_REF} style={styles.inner}>
          {children}
        </div>
      </div>
    )
  }

}
