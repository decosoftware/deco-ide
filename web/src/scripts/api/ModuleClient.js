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

import request from '../ipc/Request'
import { createJSX } from '../factories/module/TemplateFactory'
import TemplateCache from '../persistence/TemplateCache'
import RegistryCache from '../persistence/RegistryCache'
import {CACHE_STALE} from '../constants/CacheConstants'
import {
  IMPORT_MODULE,
} from 'shared/constants/ipc/ModuleConstants'
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

export const importModule = (name, version, path, registry) => {
  return request(_importModule(name, version, path, registry))
}

export const fetchTemplateText = (url) => {
  return FetchUtils.fetchResource(url).then((result) => result.text())
}

export const fetchTemplateMetadata = (url) => {
  return FetchUtils.fetchResource(url).then((result) => result.json())
}

export const fetchTemplateAndImportDependencies = (deps, textUrl, metadataUrl, path, registry, mod) => {

  if (deps && ! _.isEmpty(deps) && path) {

    // TODO: multiple deps
    const depName = _.first(_.keys(deps))
    const depVersion = deps[depName]

    // TODO: consider waiting for npm install to finish
    importModule(depName, depVersion, path, registry)
  }

  // Starting with schemaVersion 0.0.3, the JSX template is generated.
  if (
    semver.valid(mod.schemaVersion) &&
    semver.satisfies(mod.schemaVersion, '>= 0.0.3')
  ) {
    return Promise.resolve({text: createJSX(mod)})
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
