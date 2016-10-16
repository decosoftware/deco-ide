import _ from 'lodash'
import React from 'react'
import { batchActions } from 'redux-batched-subscribe'

const remote = Electron.remote
const path = remote.require('path')
const Menu = remote.Menu
const MenuItem = remote.MenuItem

import * as ContentLoader from '../api/ContentLoader'
import * as URIUtils from '../utils/URIUtils'
import { CONTENT_PANES } from '../constants/LayoutConstants'
import { tabActions, fileActions, compositeFileActions } from '../actions'
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
  const uri = URIUtils.filePathToURI(filePath)

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
    new MenuItem({ type: 'separator' }),
    new MenuItem({
      label: 'Split Right',
      click: () => {
        dispatch(fileActions.registerPath(filePath))
        dispatch(tabActions.splitRight(CONTENT_PANES.CENTER, uri))
      }
    }),
    new MenuItem({ type: 'separator' }),
    ...ContentLoader.filterLoaders(uri).map(loader => {
      const {name, id} = loader

      return new MenuItem({
        label: `Open as ${name}`,
        click: () => {
          const uriWithLoader = ContentLoader.getURIWithLoader(uri, id)

          // Make the previous tab permanent, open the new tab, and make it permanent too
          dispatch(batchActions([
            fileActions.registerPath(filePath),
            tabActions.makeTabPermanent(CONTENT_PANES.CENTER),
            tabActions.addTab(CONTENT_PANES.CENTER, uriWithLoader),
            tabActions.makeTabPermanent(CONTENT_PANES.CENTER, uriWithLoader),
          ]))
        }
      })
    }),
    new MenuItem({ type: 'separator' }),
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
          onTextDone: async (fileName) => {
            const newFilePath = path.join(dirPath, fileName)

            await dispatch(createFile(newFilePath))
            dispatch(compositeFileActions.openFile(newFilePath))
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
