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

import LocalStorage from '../persistence/LocalStorage'

const ONBOARDING_KEY = 'ONBOARDING'

export default {
  shouldOpenConsoleForFirstTime() {
    const saved = LocalStorage.loadObject(ONBOARDING_KEY)
    const {consoleShown = false} = saved
    return ! consoleShown
  },
  didOpenConsoleForFirstTime() {
    const saved = LocalStorage.loadObject(ONBOARDING_KEY)
    LocalStorage.saveObject(ONBOARDING_KEY, {
      ...saved,
      consoleShown: true,
    })
  },
}
