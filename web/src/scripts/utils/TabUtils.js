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

class TabUtils {

  static createContainer() {
    return {
      focusedGroupIndex: 0,
      groups: [
        this.createGroup(),
      ],
    }
  }

  static createGroup() {
    return {
      tabIds: [],
      focusedTabId: null,
      ephemeralTabId: null,
    }
  }

  static getContainer(state, containerId) {
    const container = state[containerId]

    return container ? container : this.createContainer()
  }

  static addTab(container, tabId, groupIndex, index) {
    let {focusedTabId, ephemeralTabId, tabIds} = container.groups[0]

    // If there's an ephemeral tab, swap it for the tab to add (unless the tab
    // to add is already open)
    if (ephemeralTabId && tabIds.indexOf(tabId) === -1) {
      container = this.swapTab(container, ephemeralTabId, tabId)
      const group = container.groups[0]
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
      groups: {
        [0]: {
          $merge: {
            focusedTabId: tabId,
            ephemeralTabId: ephemeralTabId,
            tabIds: newTabIds,
          }
        }
      }
    })
  }

  static swapTab(container, tabId, newTabId) {
    const {focusedTabId, ephemeralTabId, tabIds} = container.groups[0]

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
      groups: {
        [0]: {
          $merge: {
            focusedTabId: newFocusedTabId,
            ephemeralTabId: ephemeralTabId === tabId ? newTabId : ephemeralTabId,
            tabIds: newTabIds,
          }
        }
      }
    })
  }

  static closeTab(container, tabId) {
    const {focusedTabId, ephemeralTabId, tabIds} = container.groups[0]

    // If the tab to close is focused, reset focus to tab 0
    let newFocusedTabId
    if (focusedTabId && focusedTabId === tabId) {
      newFocusedTabId = tabIds.length ? tabIds[0] : null
    } else {
      newFocusedTabId = focusedTabId
    }

    return update(container, {
      groups: {
        [0]: {
          $merge: {
            focusedTabId: newFocusedTabId,
            ephemeralTabId: ephemeralTabId === tabId ? null : ephemeralTabId,
            tabIds: _.without(tabIds, tabId),
          }
        }
      }
    })
  }

  static focusTab(container, tabId) {
    return update(container, {
      groups: {
        [0]: {
          $merge: {
            focusedTabId: tabId,
          }
        }
      }
    })
  }

  static makeTabPermanent(container) {
    return update(container, {
      groups: {
        [0]: {
          $merge: {
            ephemeralTabId: null,
          }
        }
      }
    })
  }

  // Try to focus another tab when one is closed
  static determineTabToFocus(container, closedTabId) {
    if (!container) return null

    const {focusedTabId, tabIds} = container.groups[0]

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

}

export default TabUtils
