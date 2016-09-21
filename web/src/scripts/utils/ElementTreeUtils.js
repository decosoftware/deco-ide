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
import t from 't'
import N from './simpleCodeMirrorPosition'

// Update the positions in the elementTree by `offset`, starting at `from`
export const offsetTreePositions = (tree, from, offset) => {

  // Update anything that looks like a position
  const isPosition = (value) => _.isObject(value) && value.ch && value.line

  const updatePosition = (position) => {

    // If this position is after the change
    // TODO offset contains multiple lines
    if (position.line === from.line && position.ch > from.ch) {
      position.ch += offset.ch
    }
  }

  t.bfs(tree, (node) => {

    // Update the element
    _.each(node, (value, key) => {
      if (isPosition(value)) {
        updatePosition(value)
      }
    })

    // Update all props
    _.each(node.props, (prop) => {
      _.each(prop, (value, key) => {
        if (isPosition(value)) {
          updatePosition(value)
        }
      })
    })
  })
}

export const deepUpdateProp = (tree, elementPath, propName, value, text) => {
  const newTree = _.cloneDeep(tree)
  const element = getElementByPath(newTree, elementPath)

  const {props = []} = element
  const prop = props.find(x => x.name === propName)

  const oldLength = prop.valueEnd.ch - prop.valueStart.ch
  const newLength = text.length

  // Update the prop's value
  prop.value = value

  if (newLength !== oldLength) {
    offsetTreePositions(newTree, prop.valueStart, {ch: newLength - oldLength})
  }

  return newTree
}

export const insertInTree = (element, parent, elementPath = '') => {
  const {start, end} = element

  for (let i = 0; i < parent.children.length; i++) {
    const child = parent.children[i]

    // Find a place among children of this parent
    if (N(start) >= N(child.start) && N(end) <= N(child.end)) {
      return insertInTree(element, child, elementPath + '.' + i)
    }
  }

  element.elementPath = elementPath + '.' + parent.children.length

  // Otherwise, append to parent
  parent.children.push(element)
}

export const getElementByPath = (tree, elementPath) => {

  // ".0.1.0"
  const indexes = elementPath
    .split('.') // => ["", "0", "1", "0"]
    .slice(1) // => ["0", "1", "0"]
    .map(x => parseInt(x)) // => [0, 1, 0]

  let element = tree
  for (let i = 0; i < indexes.length; i++) {
    element = element.children[indexes[i]]
  }

  return element
}

const within = (pos, start, end, mode) => {
  const npos = N(pos)

  if (mode === 'inclusive') {
    return npos >= N(start) && npos <= N(end)
  } else {
    return npos > N(start) && npos < N(end)
  }
}

export const getElementByPos = (element, pos, mode) => {
  const {openStart, openEnd, closeStart, closeEnd} = element

  const withinOpenTag = within(pos, openStart, openEnd, mode)
  const withinCloseTag = closeStart && closeEnd && within(pos, closeStart, closeEnd, mode)

  if (withinOpenTag || withinCloseTag) {
    return element
  }

  for (let i = 0; i < element.children.length; i++) {
    const child = element.children[i]
    const match = getElementByPos(child, pos, mode)

    if (match) {
      return match
    }
  }

  return null
}

export const getComponentForElement = (element, components) => {
  return _.find(components, ['name', element.name])
}

export const getInteractiveProps = (element, components) => {
  const component = getComponentForElement(element, components)

  if (! component) {
    return []
  }

  const {props} = component

  if (! props) {
    return []
  }

  return props.filter(prop => prop.interactionEnabled)
}

export const elementWillInsertInTreeAtPath = (parent, start, end, elementPath = '') => {
  end = end || start

  for (let i = 0; i < parent.children.length; i++) {
    const child = parent.children[i]

    if (N(end) <= N(child.start)) {
      return elementPath + '.' + i
    }

    // Find a place among children of this parent
    if (N(start) >= N(child.start) && N(end) <= N(child.end)) {
      return elementWillInsertInTreeAtPath(child, start, end, elementPath + '.' + i)
    }
  }

  return elementPath + '.' + parent.children.length
}
