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

import fileHandler from '../handlers/fileHandler'
import projectHandler from '../handlers/projectHandler'
import windowHandler from '../handlers/windowHandler'
import processHandler from '../handlers/processHandler'
import componentHandler from '../handlers/componentHandler'
import moduleHandler from '../handlers/moduleHandler'
import preferenceHandler from '../handlers/preferenceHandler'

const handlers = [
  projectHandler,
  windowHandler,
  processHandler,
  componentHandler,
  fileHandler,
  moduleHandler,
  preferenceHandler,
]

export const registerHandlers = () => {
  _.each(handlers, (handler) => {
    handler.register()
  })
}
