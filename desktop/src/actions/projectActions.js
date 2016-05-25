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

'use strict'

const path = require('path')

import ProjectConstants from 'shared/constants/ipc/ProjectConstants'
const {
  CREATE_NEW_PROJECT,
  SET_PROJECT_DIR,
  SAVE_PROJECT,
  SAVE_AS_PROJECT,
} = ProjectConstants

const EventTypes = {
  newProject: 'project.create-new-project',
}

const RequestTypes = {}


export const setProject = (projectPath, isTemp) => {
  return {
    type: SET_PROJECT_DIR,
    absolutePath: new Buffer(projectPath).toString('hex'),
    isTemp: isTemp,
  }
}

export const newProject = () => {
  return {
    type: CREATE_NEW_PROJECT,
  }
}

export const save = () => {
  return {
    type: SAVE_PROJECT,
  }
}

export const saveAs = () => {
  return {
    type: SAVE_AS_PROJECT,
  }
}
