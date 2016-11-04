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
import update from 'react-addons-update'
import * as URIUtils from '../utils/URIUtils'

class TabUtils {

  static createContainer() {
    return {
      focusedGroupIndex: 0,
      groups: [],
    }
  }

  static createGroup() {
    return {
      tabIds: [],
      focusedTabId: null,
      ephemeralTabId: null,
    }
  }

  static forEachTab(tabs, fn) {
    _.each(tabs, (container) => {
      _.each(container.groups, (group) => {
        _.each(group.tabIds, (id) => {
          fn(container, group, id)
        })
      })
    })
  }

  static selectTabsWithIdContainingString(tabs, matchStr) {
    const selected = []
    TabUtils.forEachTab(tabs, (container, group, id) => {
      if (id.indexOf(matchStr) != -1) {
        selected.push({container, group, id})
      }
    })
    return selected
  }

  static getContainer(state, containerId) {
    const container = state[containerId]

    return container ? container : this.createContainer()
  }

  static getGroupIndex(container = {}, groupIndex) {
    const {focusedGroupIndex} = container

    return typeof groupIndex === 'number' ? groupIndex : focusedGroupIndex
  }

  static getGroup(container = {}, groupIndex) {
    const groups = container.groups || []

    return groups[this.getGroupIndex(container, groupIndex)] || this.createGroup()
  }

  static getFocusedTabId(container, groupIndex) {
    const group = this.getGroup(container, groupIndex)

    return group.focusedTabId
  }

  static addTab(container, tabId, groupIndex, index) {
    groupIndex = this.getGroupIndex(container, groupIndex)

    let group = container.groups[groupIndex] || this.createGroup()
    let {focusedTabId, ephemeralTabId, tabIds} = group

    // If there's an ephemeral tab, swap it for the tab to add (unless the tab
    // to add is already open)
    if (ephemeralTabId && tabIds.indexOf(tabId) === -1) {
      container = this.swapTab(container, ephemeralTabId, tabId)
      const group = container.groups[groupIndex]
      focusedTabId = group.focusedTabId
      ephemeralTabId = group.ephemeralTabId
      tabIds = group.tabIds
    }

    let newTabIds = _.clone(tabIds)

    // Position defaults to after the focusedTab
    if (typeof index === 'undefined') {
      const focusedTabPosition = newTabIds.indexOf(focusedTabId)
      index = focusedTabPosition !== -1 ? focusedTabPosition + 1 : 0
    }

    // Add tab only if it doesn't exist
    if (newTabIds.indexOf(tabId) === -1) {
      newTabIds.splice(index, 0, tabId)
      ephemeralTabId = tabId
    }

    return update(container, {
      focusedGroupIndex: {$set: groupIndex},
      groups: {
        [groupIndex]: {
          $set: {
            focusedTabId: tabId,
            ephemeralTabId: ephemeralTabId,
            tabIds: newTabIds,
          }
        }
      }
    })
  }

  static swapTab(container, tabId, newTabId, groupIndex) {
    groupIndex = this.getGroupIndex(container, groupIndex)

    const group = container.groups[groupIndex] || this.createGroup()
    const {focusedTabId, ephemeralTabId, tabIds} = group

    // Tab to swap was not open
    if (tabIds.indexOf(tabId) === -1) {
      return container
    }

    // Update focus only if the swapped tab was focused
    let newFocusedTabId
    if (focusedTabId && focusedTabId === tabId) {
      newFocusedTabId = newTabId
    } else {
      newFocusedTabId = focusedTabId
    }

    // Remove the old tab, splice in the new
    const index = tabIds.indexOf(tabId)
    const newTabIds = _.clone(tabIds)
    newTabIds.splice(index, 1, newTabId)

    return update(container, {
      focusedGroupIndex: {$set: groupIndex},
      groups: {
        [groupIndex]: {
          $merge: {
            focusedTabId: newFocusedTabId,
            ephemeralTabId: ephemeralTabId === tabId ? newTabId : ephemeralTabId,
            tabIds: newTabIds,
          }
        }
      }
    })
  }

  static closeTab(container, tabId, groupIndex) {
    groupIndex = this.getGroupIndex(container, groupIndex)

    const group = container.groups[groupIndex] || this.createGroup()
    const {focusedTabId, ephemeralTabId, tabIds} = group

    // If there are remaining tabs, focus one
    if (tabIds.length > 1) {
      return update(container, {
        focusedGroupIndex: {$set: groupIndex},
        groups: {
          [groupIndex]: {
            $merge: {
              focusedTabId: this.determineTabToFocus(container, tabId, groupIndex),
              ephemeralTabId: ephemeralTabId === tabId ? null : ephemeralTabId,
              tabIds: _.without(tabIds, tabId),
            }
          }
        }
      })

    // Else, delete this tab group
    } else {
      return update(container, {
        focusedGroupIndex: {$set: 0},
        groups: {$splice: [[groupIndex, 1]]}
      })
    }
  }

  static focusTab(container, tabId, groupIndex) {
    groupIndex = this.getGroupIndex(container, groupIndex)

    return update(container, {
      focusedGroupIndex: {$set: groupIndex},
      groups: {
        [groupIndex]: {
          $merge: {
            focusedTabId: tabId,
          }
        }
      }
    })
  }

  static makeTabPermanent(container, groupIndex) {
    groupIndex = this.getGroupIndex(container, groupIndex)

    return update(container, {
      focusedGroupIndex: {$set: groupIndex},
      groups: {
        [groupIndex]: {
          $merge: {
            ephemeralTabId: null,
          }
        }
      }
    })
  }

  // Try to focus another tab when one is closed
  static determineTabToFocus(container, closedTabId, groupIndex) {
    if (!container) return null

    const {focusedTabId, tabIds} = this.getGroup(container, groupIndex)

    // If the tab to close is focused, and there are at least 2 tabs
    if (closedTabId === focusedTabId && tabIds.length >= 2) {
      const index = tabIds.indexOf(closedTabId)
      if (index !== -1) {

        // If the tab to close is the first tab, focus the new first tab
        if (index === 0) {
          return tabIds[1]

        // Else, focus the previous tab
        } else {
          return tabIds[index - 1]
        }
      }

    // Else if another tab is focused, keep it focused
    } else if (closedTabId !== focusedTabId) {
      return focusedTabId
    }

    // The closed tab is the only tab, so return null
    return null
  }

  static getAdjacentTab(group, direction = 'next') {
    if (!group) return null

    const {tabIds, focusedTabId} = group

    if (tabIds.length === 0) return null

    const focusedIndex = tabIds.indexOf(focusedTabId)
    let newFocusedIndex = focusedIndex + (direction === 'next' ? 1 : -1)

    // Make sure the new index refers to an existing tab
    newFocusedIndex = (newFocusedIndex + tabIds.length) % tabIds.length

    return tabIds[newFocusedIndex]
  }

  static getAdjacentGroupIndex(container, direction) {
    if (!container) return -1

    const {groups, focusedGroupIndex} = container
    if (groups.length === 0) return -1

    let newFocusedIndex = focusedGroupIndex + (direction === 'next' ? 1 : -1)

    // Make sure the new index refers to an existing group
    newFocusedIndex = (newFocusedIndex + groups.length) % groups.length

    return newFocusedIndex
  }

  static getTabsForResource(container, uri) {
    if (!container) return []

    const {groups} = container

    // Return any tabs in any group that match the resource
    return groups.reduce((acc, group, groupIndex) => {
      const {tabIds} = group

      tabIds.forEach((tabId) => {
        if (URIUtils.matchesResource(uri, tabId)) {
          acc.push({tabId, groupIndex})
        }
      })

      return acc
    }, [])
  }

}

export default TabUtils
