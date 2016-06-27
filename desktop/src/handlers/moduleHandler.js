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
import fs from 'fs'
import path from 'path'
import jsonfile from 'jsonfile'
import dir from 'node-dir'

import Logger from '../log/logger'
import npm from '../process/npmController'
import bridge from '../bridge'
import { onSuccess, onError } from '../actions/genericActions'
import { startProgressBar, updateProgressBar, endProgressBar } from '../actions/uiActions'
import { foundRegistries } from '../actions/moduleActions'
import ModuleConstants from 'shared/constants/ipc/ModuleConstants'

class ModuleHandler {

  register() {
    bridge.on(ModuleConstants.IMPORT_MODULE, this.importModule.bind(this))
    bridge.on(ModuleConstants.SCAN_PROJECT_FOR_REGISTRIES, this.scanPathForRegistries.bind(this))
  }

  readPackageJSON(projectPath) {
    const packagePath = path.join(projectPath, 'package.json')
    return new Promise((resolve, reject) => {
      try {
        jsonfile.readFile(packagePath, (err, obj) => {
          if (err && err.code !== 'ENOENT') {
            Logger.info('Failed to read package.json')
            Logger.error(err)
            reject(err)
          } else {
            resolve(obj)
          }
        })
      } catch (e) {
        Logger.error(e)
        reject(e)
      }
    })
  }

  /**
   * Return a map of {filepath => package.json contents}
   * @param  {String} dirname Directory to scan
   * @return {Promise}
   */
  readAllPackageJSON(dirname) {
    return new Promise((resolve, reject) => {
      const data = {}

      const onReadFile = (err, content, filepath, next) => {
        if (err) {
          return next()
        }

        try {
          data[filepath] = JSON.parse(content)
        } catch (e) {
          return next()
        }

        return next()
      }

      const onComplete = (err, files) => {
        if (err) {
          return reject()
        }

        resolve(data)
      }

      const options = {
        match: /package.json$/,
        // For now, limit to just searching this project's package.json
        excludeDir: /node_modules/,
        matchFullName: true,
      }

      try {
        dir.readFiles(dirname, options, onReadFile, onComplete)
      } catch (err) {
        Logger.error(err)
      }
    })
  }

  readAllComponentLists(dirname) {
    dirname = path.resolve(dirname)

    return this.readAllPackageJSON(dirname).then((packageMap) => {
      const registries = {}

      // Build a new map, {filepath => components}, filtering out any package.json
      // which doesn't contain components
      _.each(packageMap, (json, filepath) => {
        const registry = _.get(json, 'deco.components')

        if (registry) {
          registries[filepath] = registry
        }
      })

      return registries
    }).then((registryMap) => {

      // Resolve any local paths e.g. './component.js' to absolute paths
      return _.mapValues(registryMap, (components, filepath) => {
        return this.resolveLocalPathsInComponents(
          path.dirname(filepath),
          components
        )
      })
    })
  }

  resolveLocalPathsInComponents(parentPath, components) {

    const resolve = (component, property) => {
      const value = _.get(component, property)

      if (typeof value === 'string' && value.startsWith('./')) {
        _.set(component, property, path.join(parentPath, value))
      }
    }

    _.each(components, (component) => {
      resolve(component, 'template.text')
      resolve(component, 'template.metadata')
    })

    return components
  }

  scanPathForRegistries({path}, respond) {
    this.readAllComponentLists(path).then((registryMap) => {
      respond(foundRegistries(registryMap))
    })
  }

  importModule(options, respond) {

    options.version = options.version || 'latest'

    const {name, version, path: installPath } = options

    this.readPackageJSON(options.path).then((packageJSON = {}) => {
      const {dependencies} = packageJSON

      // If the dependency exists, and the version is compatible
      if (dependencies && dependencies[name] &&
          (version === '*' || version === dependencies[name])) {
        Logger.info(`npm: dependency ${name}@${version} already installed`)
        respond(onSuccess(ModuleConstants.IMPORT_MODULE))
      } else {
        const progressCallback = _.throttle((percent) => {
          bridge.send(updateProgressBar(name, percent * 100))
        }, 250)

        bridge.send(startProgressBar(name, 0))

        try {
          const command = [
            'install', '-S', `${name}@${version}`,
            ...options.registry && ['--registry', options.registry]
          ]

          Logger.info(`npm ${command.join(' ')}`)

          npm.run(command, {cwd: installPath}, (err) => {

            // Ensure a trailing throttled call doesn't fire
            progressCallback.cancel()

            bridge.send(endProgressBar(name, 100))

            if (err) {
              Logger.info(`npm: dependency ${name}@${version} failed to install`)
              respond(onError(ModuleConstants.IMPORT_MODULE))
            } else {
              Logger.info(`npm: dependency ${name}@${version} installed successfully`)
              respond(onSuccess(ModuleConstants.IMPORT_MODULE))
            }
          }, progressCallback)
        } catch(e) {
          Logger.error(e)
          respond(onError(ModuleConstants.IMPORT_MODULE))
        }
      }
    })

  }

}

export default new ModuleHandler()
