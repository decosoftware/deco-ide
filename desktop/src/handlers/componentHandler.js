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

import path from 'path'
import child_process from 'child_process'

import _ from 'lodash'
import fs from 'fs-plus'
import _fs from 'fs'

import bridge from '../bridge'
import ComponentConstants from 'shared/constants/ipc/ComponentConstants'
const {
  IMPORT_COMPONENT,
  GET_COMPONENT_LIST,
} = ComponentConstants
import ErrorConstants from 'shared/constants/ipc/ErrorConstants'
const { ERROR, } = ErrorConstants

import {
  onError
} from '../actions/genericActions'

import {
  onComponentList,
  onImportComponent,
} from '../actions/componentActions'

import Logger from '../log/logger'

import {
  CACHE_FOLDER,
} from '../constants/DecoPaths'

class ComponentHandler {
  register() {
    bridge.on(IMPORT_COMPONENT, this.getComponentList.bind(this))
    bridge.on(GET_COMPONENT_LIST, this.getComponentList.bind(this))
  }

  _verifyOrCreateComponentFolder(rootPath) {
    const compFolderPath = path.join(rootPath, 'Components')
    try {
      if (fs.isDirectorySync(compFolderPath)) {
        return compFolderPath
      } else {
        child_process.spawnSync('mkdir', ['-p', compFolderPath])
        return compFolderPath
      }
    } catch (e) {
      Logger.error(e)
      return null
    }
  }

  importComponent(payload, respond) {
    try {
      const compPaths = fs.listSync(CACHE_FOLDER)
      const componentName = payload.componentName
      const matchingPathIdx = _.findIndex(compPaths, (comp) => {
        return path.basename(comp).includes(componentName)
      })
      if (matchingPathIdx == -1) {
        respond(onError('Could not find a component with that name'))
        return
      }
      const componentPkg = compPaths[matchingPathIdx]
      let projectRoot = payload.projectRoot
      if (typeof projectRoot != 'string') {
        projectRoot = [''].concat(projectRoot).join('/')
      }
      const componentFolder = this._verifyOrCreateComponentFolder(projectRoot)
      if (!componentFolder) {
        respond(onError('Could not find or initialize component folder in project root'))
        return
      }
      child_process.spawnSync('tar', ['-xzf', componentPkg, '-C', componentFolder])
      const componentMetadataPath = path.join(componentFolder, componentName, componentName + '.js.deco')
      const requirePath = path.join(componentFolder, componentName, componentName).split('/')
      requirePath.shift() //get rid of leading slash
      _fs.readFile(componentMetadataPath, (err, data) => {
        if (err) {
          Logger.error(err)
          respond(onError('Could not get component metadata'))
          return
        }
        const metadata = JSON.parse(data.toString())
        respond(onImportComponent(metadata, requirePath))
      })
    } catch (e) {
      Logger.error(e)
      respond(onError('Component failed to import'))
    }
  }

  getComponentList(payload, respond) {
    try {
      const compPaths = fs.listSync(CACHE_FOLDER)
      const componentList = _.map(compPaths, (comp) => {
        const base = path.basename(comp)
        return {
          name: base.slice(0, base.indexOf('.tar.gz'))
        }
      })
      respond(onComponentList(componentList))
    } catch (e) {
      Logger.error(e)
      respond(onError('fatal error when fetching component list'))
    }
  }

}

const handler = new ComponentHandler()
export default handler
