import _ from 'lodash'
import React from 'react'

const remote = Electron.remote;
const path = remote.require('path')
const Menu = remote.Menu;
const MenuItem = remote.MenuItem;

import { fileTreeController as controller } from './index'
import {
  renameFile,
  renameDir,
  createFile,
  createDir,
  deleteFile,
  deleteDir,
} from '../actions/fileTreeCompositeActions'
import {
  pushModal
} from '../actions/uiActions'

import NamingBanner from '../components/modal/NamingBanner'

export const showContextMenu = (dispatch, e, node, nodeMetadata, index) => {
  e.preventDefault()
  const { type } = node
  buildMenu(type, dispatch, node).popup(remote.getCurrentWindow())
}

const ShowNamingBanner = (props) => {
  return pushModal(<NamingBanner {...props} />, true)
}

const buildFileMenu = (dispatch, node) => {
  const { name, path: filePath, type } = node
  return [
    new MenuItem({
      label: 'Rename',
      click: () => {
        dispatch(ShowNamingBanner({
          bannerText: `Rename file ${name}`,
          initialValue: name,
          onTextDone: (newPath) => {
            const absoluteNewPath = path.join(path.dirname(filePath), newPath)
            dispatch(renameFile(filePath, absoluteNewPath))
          },
        }))
      }
    }),
    new MenuItem({
      label: 'Delete',
      click: () => {
        dispatch(deleteFile(filePath))
      }
    }),
    new MenuItem({
      label: 'Show in Finder',
      click: () => {
        dispatch(showInFinder(filePath))
      }
    })
  ]
}

const buildDirectoryMenu = (dispatch, node) => {
  const { name, path: dirPath, type } = node
  return [
    new MenuItem({
      label: 'New File',
      click: () => {
        dispatch(ShowNamingBanner({
          bannerText: `Create new file in ${name}`,
          onTextDone: (fileName) => {
            const newFilePath = path.join(dirPath, fileName)
            dispatch(createFile(newFilePath))
          }
        }))
      }
    }),
    new MenuItem({
      label: 'New Directory',
      click: () => {
        dispatch(ShowNamingBanner({
          bannerText: `Create new directory in ${name}`,
          onTextDone: (dirName) => {
            const newDirPath = path.join(dirPath, dirName)
            dispatch(createDir(newDirPath))
          }
        }))
      }
    }),
    new MenuItem({ type: 'separator' }),
    new MenuItem({
      label: 'Rename',
      click: () => {
        dispatch(ShowNamingBanner({
          bannerText: `Rename directory ${name}`,
          initialValue: name,
          onTextDone: (newPath) => {
            const absoluteNewPath = path.join(path.dirname(dirPath), newPath)
            dispatch(renameDir(dirPath, absoluteNewPath))
          }
        }))
      }
    }),
    new MenuItem({
      label: 'Delete',
      click: () => {
        dispatch(deleteDir(dirPath))
      }
    }),
    new MenuItem({
      label: 'Show in Finder',
      click: () => {
        dispatch(showInFinder(dirPath))
      }
    })
  ]
}

const buildMenu = (type, dispatch, node) => {
  const _menu = new Menu()
  let menuItems = []
  switch (type) {
    case 'file':
      menuItems = buildFileMenu(dispatch, node)
      break
    case 'directory':
      menuItems = buildDirectoryMenu(dispatch, node)
      break
    default:
      return _menu
  }
  _.each(menuItems, (item) => {
    _menu.append(item)
  })
  return _menu
}
