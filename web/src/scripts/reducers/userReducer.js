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

import { userConstants as at } from '../actions'
import { getToken } from '../utils/AuthUtils'

const initialState = {
  token: getToken(),
  githubId: null,
  name: null,
  thumbnail: null,
  signInPending: false,
  infoPending: false,
}

export default (state = initialState, action) => {
  const {type, payload} = action

  switch(type) {
    case at.SIGN_IN_PENDING: {
      return {...state, signInPending: true}
    }

    case at.SIGN_IN_FAILURE: {
      return {...state, signInPending: false}
    }

    case at.SIGN_IN_SUCCESS: {
      return {...state, signInPending: false, token: payload}
    }

    case at.SIGN_OUT: {
      return {...state, token: null, githubId: null, name: null, thumbnail: null}
    }

    case at.USER_INFO_PENDING: {
      return {...state, infoPending: true}
    }

    case at.USER_INFO_FAILURE: {
      return {...state, infoPending: false}
    }

    case at.USER_INFO_SUCCESS: {
      const {username} = payload.auth.github
      return {...state, infoPending: false, githubId: username}
    }

    default: {
      return state
    }
  }
}
