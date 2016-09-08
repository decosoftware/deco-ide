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

import { getElementByPos } from '../utils/ElementTreeUtils'

export const at = {
  SET_ELEMENT_TREE: 'SET_ELEMENT_TREE',
  RESET_ALL_ELEMENT_TREES: 'RESET_ALL_ELEMENT_TREES',
  SELECT_ELEMENT: 'SELECT_ELEMENT',
}

export const setElementTree = (filename, elementTree) => async (dispatch) => {
  dispatch({type: at.SET_ELEMENT_TREE, payload: {filename, elementTree}})
}

export const selectElementFromPos = (filename, pos) => async (dispatch, getState) => {
  const elementTree = getState().elementTree.elementTreeForFile[filename]


  if (elementTree) {
    const element = getElementByPos(elementTree, pos, 'inclusive')

    if (element) {
      const {elementPath} = element

      dispatch({type: at.SELECT_ELEMENT, payload: {filename, elementPath}})
    }
  }
}

export const resetAllElementTrees = () => async (dispatch) => {
  dispatch({type: at.RESET_ALL_ELEMENT_TREES})
}
