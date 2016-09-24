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

const loaders = []
let getState

export const storeEnhancer = (store) => {
  getState = store.getState
}

export const registerLoader = (name, filter, renderContent) => {
  loaders.push({name, filter, renderContent})
}

// Determine how to display content
export const findLoader = (id) => {
  const state = getState()
  return loaders.find(loader => loader.filter(id, state))
}

// Used to give a list of all possible loaders, so the user can switch
// between multiple views of the same file (e.g. Text Editor vs. Storyboard)
export const filterLoaders = (id) => {
  const state = getState()
  return loaders.filter(loader => loader.filter(id, state))
}
