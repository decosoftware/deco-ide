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

import * as ElementTreeUtils from '../utils/ElementTreeUtils'

export const at = {
  SET_ELEMENT_TREE: 'SET_ELEMENT_TREE',
  RESET_ALL_ELEMENT_TREES: 'RESET_ALL_ELEMENT_TREES',
  SELECT_ELEMENT: 'SELECT_ELEMENT',
}

export const setElementTree = (filename, elementTree) => async (dispatch) => {
  dispatch({type: at.SET_ELEMENT_TREE, payload: {filename, elementTree}})
}

export const deselectElement = (filename) => async (dispatch, getState) => {
  return dispatch({type: at.SELECT_ELEMENT, payload: {filename, elementPath: null}})
}

export const selectElementFromPos = (filename, pos) => async (dispatch, getState) => {
  const elementTree = getState().elementTree.elementTreeForFile[filename]

  if (elementTree) {
    const element = ElementTreeUtils.getElementByPos(elementTree, pos, 'inclusive')

    if (element) {
      const {elementPath} = element

      return dispatch({type: at.SELECT_ELEMENT, payload: {filename, elementPath}})
    }
  }

  return dispatch(deselectElement(filename))
}

export const updateProp = (filename, element, prop, value, text) => async (dispatch, getState) => {
  const elementTree = getState().elementTree.elementTreeForFile[filename]

  if (elementTree) {
    const {elementPath} = element

    // Manually update the elementTree so it doesn't get out of sync with the inspector
    const newTree = ElementTreeUtils.deepUpdateProp(elementTree, elementPath, prop.name, value, text)

    return dispatch(setElementTree(filename, newTree))
  }
}

export const resetAllElementTrees = () => async (dispatch) => {
  dispatch({type: at.RESET_ALL_ELEMENT_TREES})
}
