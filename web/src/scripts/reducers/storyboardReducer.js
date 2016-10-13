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

import update from 'react-addons-update'
import _ from 'lodash'
import { storyboardConstants as at } from '../actions'
import shallowEqual from '../utils/dev/shallowEqual'
import * as ObjectUtils from '../utils/ObjectUtils'

const initialState = {
  scenes: {},
  connections: {},
  entry: "",
  shouldShow: false,
}

// const getPrunedConnections = (connections, connectionsToRemove) => {
//   const flattenedConnectionsToRemove = _.map(connectionsToRemove, ObjectUtils.flatten)
//   const flattenedConnections = _.map(connections, ObjectUtils.flatten)
//   ObjectUtils.shallowDiff(flattenedConnections, flattenedConnectionsToRemove).forEach(
//     (conn) => delete flattenedConnections[conn]
//   ))
//   return ObjectUtils.unflatten(flattenedConnections)
// }

export default (state = initialState, action) => {
  const {type, payload} = action

  switch(type) {
    case at.OPEN_STORYBOARD: {
      return update(state, {
        $merge: payload,
      })
    }

    case at.ADD_SCENE: {
      return update(state, {
        scenes: {
          $merge: payload,
        },
      })
    }

    case at.DELETE_SCENE: {
      return update(state, {
        scenes: {
          $set: _.omit(state.scenes, payload),
        },
      })
    }

    case at.TOGGLE_VIEW: {
      return update(state, {
        shouldShow: {
          $set: !state.shouldShow,
        },
      })
    }

    case at.SET_CONNECTIONS: {
      return update(state, {
        connections: {
          $merge: action.payload,
        },
      })
    }

    case at.DELETE_CONNECTIONS: {
      // const updatedConnections = getPrunedConnections(state.connections, action.payload);
      const updatedConnections = {};
      return update(state, {
        connections: {
          $set: updatedConnections,
        },
      })
    }

    case at.SET_ENTRY_SCENE: {
      return update(state, {
        entry: {
          $set: payload,
        },
      })
    }

    default: {
      return state
    }
  }
}
