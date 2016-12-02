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


import path from 'path'
const xdl = Electron.remote.require('xdl')
const { User, Exp } = xdl

import * as ModuleClient from '../clients/ModuleClient'

const createExponentProject = async (projectName, projectDirectory, template) => {
  try {
    // Is user signed in? Use their account
    // NOTE: This looks it up in ~/.exponent
    const user = await User.getCurrentUserAsync()

    // Otherwise use our dummy account
    if (!user) {
      await User.loginAsync({username: 'deco', password: 'password'})
    }

    await Exp.createNewExpAsync(
      template.id,          // Template id
      projectDirectory,     // Parent directory where to place the project
      {},                   // Any extra fields to add to package.json
      {name: projectName}   // Options, currently only name is supported
    )
  } catch(e) {
    alert(e.message)
  }
}

const installDependenciesAsync = async (projectName, projectDirectory, progressCallback) => {
  await ModuleClient.importModule({
    name: '@exponent/minimal-packager',
    path: path.join(projectDirectory, projectName),
  }, (({percent}) => {
    progressCallback(`Installing packages (${Math.ceil(percent * 100)})`)
  }))

  progressCallback(`All done!`)
}

export const createProject = async (projectName, projectDirectory, template, progressCallback) => {
  await createExponentProject(projectName, projectDirectory, template)
  await installDependenciesAsync(projectName, projectDirectory, progressCallback)
}

export const sanitizeProjectName = (projectName) => {
  return projectName.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')
}

// Assumes sanitized project name
export const isValidProjectName = (projectName) => {
  return !!projectName[0].match(/[a-z]/)
}
