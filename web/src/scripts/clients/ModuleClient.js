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
import semver from 'semver'
import path from 'path'
const moduleHandler = Electron.remote.require('./handlers/moduleHandler')
const npm = Electron.remote.require('./process/npmController')
const jsonfile = Electron.remote.require('jsonfile')

import { createJSX } from '../factories/module/TemplateFactory'
import TemplateCache from '../persistence/TemplateCache'
import RegistryCache from '../persistence/RegistryCache'
import { CACHE_STALE } from '../constants/CacheConstants'
import FetchUtils from '../utils/FetchUtils'

const _importModule = (name, version, path, registry) => {
  return {
    type: IMPORT_MODULE,
    name,
    path,
    version,
    registry,
  }
}

const readPackageJSON = (projectPath) => {
  const packagePath = path.join(projectPath, 'package.json')

  return new Promise((resolve, reject) => {
    try {
      jsonfile.readFile(packagePath, (err, obj) => {
        if (err && err.code !== 'ENOENT') {
          console.log('Failed to read package.json')
          console.error(err)
          reject(err)
        } else {
          resolve(obj)
        }
      })
    } catch (e) {
      console.error(e)
      reject(e)
    }
  })
}

export const importModule = async (options, onProgress = () => {}) => {
  const {
    name,
    version = 'latest',
    path: installPath,
    registry = '',
  } = options

  const packageJSON = await readPackageJSON(installPath)
  const {dependencies = {}} = packageJSON || {}

  // If the dependency exists, and the version is compatible
  if (
    dependencies[name] &&
    (version === '*' || version === dependencies[name])
  ) {
    console.log(`npm: dependency ${name}@${version} already installed`)
    return

  // Download the dependency
  } else {
    const onProgressThrottled = _.throttle(
      percent => onProgress({name, percent, completed: false})
    , 250)

    const command = [
      'install', '-S', `${name}@${version}`,
      ...registry && ['--registry', registry],
    ]

    console.log(`npm ${command.join(' ')}`)

    onProgress({name, percent: 0, completed: false})

    try {
      await npm.run(command, {cwd: installPath}, onProgressThrottled)
    } catch ({type, error}) {
      const message = `npm: dependency ${name}@${version} failed to install`
      console.log(message)
      console.error(error)
      throw new Error(message)
    }

    // Ensure a trailing throttled call doesn't fire
    onProgressThrottled.cancel()
    onProgress({name, percent: 1, completed: true})

    console.log(`npm: dependency ${name}@${version} installed successfully`)
  }
}

export const fetchTemplateText = (url) => {
  return FetchUtils.fetchResource(url).then((result) => result.text())
}

export const fetchTemplateMetadata = (url) => {
  return FetchUtils.fetchResource(url).then((result) => result.json())
}

export const fetchTemplateAndImportDependencies = (deps, textUrl, metadataUrl, path, registry, mod) => {

  // Starting with schemaVersion 0.1.0, the JSX template is generated.
  if (
    semver.valid(mod.schemaVersion) &&
    semver.satisfies(mod.schemaVersion, '>= 0.1.0')
  ) {

    // TODO: multiple deps
    if (deps.length > 0) {
      const {name, version} = deps[0]
      importModule({name, version, path, registry})
    }

    return Promise.resolve({text: createJSX(mod)})
  }

  if (deps && ! _.isEmpty(deps) && path) {

    // TODO: multiple deps
    const depName = _.first(_.keys(deps))
    const depVersion = deps[depName]

    // TODO: consider waiting for npm install to finish
    importModule({
      name: depName,
      version: depVersion,
      path,
      registry,
    })
  }

  const performFetch = () => {

    // Cache miss or failure - fetch text and metadata
    return Promise.all([
      fetchTemplateText(textUrl),
      fetchTemplateMetadata(metadataUrl),
    ]).then(([text, metadata]) => {

      TemplateCache.put(textUrl, metadataUrl, text, metadata)

      return {
        text,
        metadata,
      }
    })
  }

  // Always fetch local files
  if (FetchUtils.isLocal(textUrl)) {
    return performFetch()

  // Return result from cache, or fetch on failure
  } else {
    return TemplateCache.get(textUrl, metadataUrl).then(({text, metadata}) => {
      return {text, metadata}
    }).catch(performFetch)
  }

}

export const fetchModuleRegistry = (url) => {
  return RegistryCache.get(url).catch((err) => {

    const staleValue = err && err.code === CACHE_STALE && err.value

    // On cache miss, fetch
    return fetch(url).then((result) => {
      return result.json()

    // Add to cache
    }).then((packageJSON) => {
      RegistryCache.put(url, packageJSON)
      return packageJSON

    // Failed to fetch... use staleValue if available
    }).catch((err) => new Promise((resolve, reject) => {
      if (staleValue) {
        resolve(staleValue)
      } else {
        reject(err)
      }
    }))

  }).then((packageJSON) => {
    return _.get(packageJSON, 'deco.components', [])
  })
}

export const DEFAULT_REGISTRY = "https://rawgit.com/decosoftware/deco-components/master/package.json"
