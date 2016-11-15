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
import * as URIUtils from '../utils/URIUtils'

const loaders = []
let getState

export const storeEnhancer = (store) => {
  getState = store.getState
}

const REQUIRED_LOADER_KEYS = ['name', 'id', 'filter', 'renderContent']

export const registerLoader = (loader) => {
  REQUIRED_LOADER_KEYS.forEach(key => {
    if (!loader[key]) {
      throw new Error(`Registered loader ${loader.name || ''} missing key: ${key}`)
    }
  })

  loaders.push(loader)
}

// Determine how to display content
export const findLoader = (uri) => {
  if (!uri) return null

  const state = getState()
  return loaders.find(loader => loader.filter(uri, state))
}

// Used to give a list of all possible loaders, so the user can switch
// between multiple views of the same file (e.g. Text Editor vs. Storyboard)
export const filterLoaders = (uri) => {
  if (!uri) return []

  const state = getState()
  return loaders.filter(loader => loader.filter(uri, state))
}

export const getResourceName = (uri) => {
  const loader = findLoader(uri)

  if (loader && loader.getResourceName) {
    const state = getState()
    return loader.getResourceName(uri, state)
  } else {
    return path.basename(URIUtils.withoutProtocolOrParams(uri))
  }
}

export const getResourceNameAndPath = (uri) => {
  return {
    name: getResourceName(uri),
    path: URIUtils.withoutProtocol(uri),
  };
}

export const getURIWithLoader = (uri, id) => {
  const defaultLoader = findLoader(uri)

  // If we would use the correct loader anyway, return the uri unmodified
  if (defaultLoader && id === defaultLoader.id) {
    return uri

  // Else, return the uri with the loader param appended
  } else {
    return URIUtils.createUrl(uri, {loader: id})
  }
}
