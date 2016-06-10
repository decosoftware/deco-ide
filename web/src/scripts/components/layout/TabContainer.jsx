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
import TabUtils from '../../utils/TabUtils'

const TAB_CONTAINER_REF = 'container'

const innerStyle = {
  width: '100%',
  height: '100%',
  flexDirection: 'row',
  alignItems: 'stretch',
  display: 'flex',
}

const itemStyle = {
  flex: '0 0 150px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'stretch',
  position: 'relative',
}

class TabContainer extends Component {

  constructor(props) {
    super(props)
  }

  render() {
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
          const tabToFocus = TabUtils.determineTabToFocus(tabIds, tabIds[i], this.props.focusedTabId)
          this.props.onCloseTab(tabIds[i], tabToFocus)
        },
        focused: tabIds[i] === this.props.focusedTabId,
      })

      const itemStyleSized = Object.assign({}, itemStyle, {
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
        <div ref={TAB_CONTAINER_REF} style={innerStyle}>
          {children}
        </div>
      </div>
    )
  }

}

TabContainer.defaultProps = {
  focusedTabId: null,
}

export default TabContainer
