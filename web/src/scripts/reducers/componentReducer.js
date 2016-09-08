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

import { componentConstants as at } from '../actions'

const initialState = {
  list: [],
  fetchPending: false,
  createPending: false,
  updatePending: false,
  deletePending: false,
}

export default (state = initialState, action) => {
  const {type, payload} = action

  switch(type) {
    case at.COMPONENTS_FETCH_REQUEST_PENDING: {
      return {...state, fetchPending: true}
    }

    case at.COMPONENTS_FETCH_REQUEST_SUCCESS: {
      return {...state, fetchPending: false, list: payload}
    }

    case at.COMPONENTS_FETCH_REQUEST_FAILURE: {
      return {...state, fetchPending: false}
    }

    case at.COMPONENT_CREATE_REQUEST_PENDING: {
      return {...state, createPending: true}
    }

    case at.COMPONENT_CREATE_REQUEST_SUCCESS: {
      const {list} = state
      return {...state, createPending: false, list: [...list, payload]}
    }

    case at.COMPONENT_CREATE_REQUEST_FAILURE: {
      return {...state, createPending: false}
    }

    // Once the update request is made, optimistically update the list
    case at.COMPONENT_UPDATE_REQUEST_PENDING: {
      const {list} = state
      const existingIndex = _.findIndex(list, ['id', payload.id])
      const updatedList = existingIndex !== -1 ? [
        ...list.slice(0, existingIndex),
        payload,
        ...list.slice(existingIndex + 1, list.length),
      ] : list
      return {...state, updatePending: true, list: updatedList}
    }

    case at.COMPONENT_UPDATE_REQUEST_SUCCESS: {
      return {...state, updatePending: false}
    }

    case at.COMPONENT_UPDATE_REQUEST_FAILURE: {
      return {...state, updatePending: false}
    }

    // Once the delete request is made, optimistically update the list
    case at.COMPONENT_DELETE_REQUEST_PENDING: {
      const {list} = state
      const existingIndex = _.findIndex(list, ['id', payload.id])
      const updatedList = existingIndex !== -1 ? [
        ...list.slice(0, existingIndex),
        ...list.slice(existingIndex + 1, list.length),
      ] : list
      return {...state, deletePending: true, list: updatedList}
    }

    case at.COMPONENT_DELETE_REQUEST_SUCCESS: {
      return {...state, deletePending: false}
    }

    case at.COMPONENT_DELETE_REQUEST_FAILURE: {
      return {...state, deletePending: false}
    }

    default: {
      return state
    }
  }
}
