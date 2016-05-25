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

//PRIVATE
function getRelativeRootArray(rootName, fullPathArray) {
  const baseIndex = fullPathArray.indexOf(rootName)
  return fullPathArray.slice(baseIndex, fullPathArray.length)
}

function mapTree(tree, fn) {
  _.forIn(tree, (val, key) => {
    if (_.isArray(val) && key == 'children') { //nested search children
      val.forEach((el) => {
        if (_.isObject(el)) {
          val = mapTree(el, fn)
        }
      })
    }
  })
  return fn(tree)
}

function addPath(tree, path, fileInfo) {
  if (path.length == 1) {
    if (!tree.children || tree.children.length == 0) {
      // set empty children only if we are sure this is a new directory
      // anything else could potentially overwrite old children
      if (!fileInfo.leaf) {
        fileInfo.children = []
      }
      fileInfo.collapsed = !fileInfo.isProjectRoot //don't collapse top level dir
      return fileInfo
    } else {
      return tree
    }
  }

  const subPath = path.slice(1, path.length)
  _.forIn(tree, (val, key) => {
    if (_.isArray(val) && key == 'children') {
      const idx = _.findIndex(val, (el) => { return el.module === subPath[0] })
      if (idx == -1) {
        val.push(
          addPath({ module: subPath[0], children: [], collapsed: true, fileType: 'dir', }, subPath, fileInfo)
        )
      } else {
        if (subPath.length == 1) {
          // if this is a directory that already exists, we simply merge in possible new information
          val[idx] = Object.assign({}, val[idx], fileInfo)
        } else {
          val[idx] = addPath(val[idx], subPath, fileInfo)
        }
      }
    }
  })

  if (_.has(tree, 'children')) {
    //order the array
    let dirs = _.filter(tree.children, (child) => {
      return child.fileType == 'dir'
    })
    let files = _.differenceWith(tree.children, dirs, (value, other) => {
      return value.fileType == other.fileType
    })

    _.orderBy(dirs, ['module'], ['asc'])
    _.orderBy(files, ['module'], ['asc'])
    tree.children = dirs.concat(files)
  }

  return tree
}

function removePath(tree, path) {
  const subPath = path.slice(1, path.length)
  _.forIn(tree, (val, key) => {
    if (_.isArray(val) && key == 'children') {
      const idx = _.findIndex(val, (el) => { return el.module === subPath[0] })
      if (idx != -1) {
        if (subPath.length == 1) {
          const val = tree.children
          tree.children = val.slice(0, idx).concat(val.slice(idx + 1, val.length))
          if (tree.children.length == 0) {
            tree.collapsed = true
          }
        } else {
          val[idx] = removePath(val[idx], subPath)
        }
      }
    }
  })
  return tree
}

//EXPORTS

export const addNode = (tree, rootName, fileInfo) => {
  if (fileInfo.fileType == 'file') {
    fileInfo.leaf = true
  } else {
    if (fileInfo.module == rootName) {
      //sub dirs with the same name as project should not be default uncollapsed
      if (fileInfo.absolutePath.indexOf(rootName) == fileInfo.absolutePath.length - 1) {
        fileInfo.isProjectRoot = true
      }
    }
  }
  return addPath(tree, getRelativeRootArray(rootName, fileInfo.absolutePath), fileInfo)
}

export const removeNode = (tree, rootName, fileInfo) => {
  return removePath(tree, getRelativeRootArray(rootName, fileInfo.absolutePath))
}

export const updateSubTree = (tree, rootName, node, oldNode) => {
  try {
    const replaceTree = mapTree(tree, (childNode) => {
      if (childNode.id == oldNode.id) {
        childNode.id = node.id
        childNode.module = node.module
        childNode.absolutePath = node.absolutePath
        return childNode
      }
      if (childNode.id.includes(oldNode.id)) {
        childNode.id = childNode.id.replace(oldNode.id, node.id)
        const childsSubPath = childNode.absolutePath.slice(oldNode.absolutePath.length, childNode.absolutePath.length)
        childNode.absolutePath = node.absolutePath.concat(childsSubPath)
      }
      return childNode
    })
    return replaceTree
  } catch (e) {
    console.log(e)
  }
  return tree
}

export const updateCollapsed = (tree, id, collapsed) => {
  return mapTree(tree, (node) => {
    if (node.id == id) {
      node.collapsed = collapsed
    }
    return node
  })
}

export const updateSelected = (tree, selectedIds) => {
  return mapTree(tree, (node) => {
    node.isSelected = _.has(selectedIds, node.id)
    return node
  })
}

export const updateSaveStatus = (tree, id, isUnsaved) => {
  return mapTree(tree, (node) => {
    if (node.id == id) {
      node.isUnsaved = isUnsaved
    }
    return node
  })
}
