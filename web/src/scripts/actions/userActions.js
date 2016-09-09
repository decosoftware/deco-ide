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

import DecoClient from '../api/DecoClient'
import CookieUtils from '../utils/CookieUtils'
import { saveToken, deleteToken } from '../utils/AuthUtils'

export const at = {
  SIGN_IN_PENDING: 'SIGN_IN_PENDING',
  SIGN_IN_SUCCESS: 'SIGN_IN_SUCCESS',
  SIGN_IN_FAILURE: 'SIGN_IN_FAILURE',

  SIGN_OUT: 'SIGN_OUT',

  USER_INFO_PENDING: 'USER_INFO_PENDING',
  USER_INFO_SUCCESS: 'USER_INFO_SUCCESS',
  USER_INFO_FAILURE: 'USER_INFO_FAILURE',
}

export const signIn = () => async (dispatch) => {
  dispatch({type: at.SIGN_IN_PENDING})

  try {
    const token = await DecoClient.authenticate()
    dispatch({type: at.SIGN_IN_SUCCESS, payload: token})
    saveToken(token)

    // Fetch user info - no need to wait for this to complete
    dispatch(fetchUserInfo())

    return token
  } catch (e) {
    dispatch({type: at.SIGN_IN_FAILURE})
    throw e
  }
}

export const signOut = () => async (dispatch) => {
  dispatch({type: at.SIGN_OUT})
  deleteToken()

  try {
    CookieUtils.remove('https://github.com')
  } catch (e) {
    console.log('Failed to delete cookies', e)
  }
}

export const fetchUserInfo = () => async (dispatch, getState) => {
  dispatch({type: at.USER_INFO_PENDING})

  try {
    const {token} = getState().user
    const result = await DecoClient.getUser('me', {access_token: token})
    dispatch({type: at.USER_INFO_SUCCESS, payload: result})
    return result
  } catch (e) {
    dispatch({type: at.USER_INFO_FAILURE})
    throw e
  }
}
