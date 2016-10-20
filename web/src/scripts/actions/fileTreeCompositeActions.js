const remote = Electron.remote;
const path = remote.require('path')

import _ from 'lodash'
import { fileTreeController as controller } from '../filetree'
import FileTreeActions from '../filetree/actions'
import * as URIUtils from '../utils/URIUtils'
import { tabActions } from '../actions'

import {
  showInFinder,
  registerPath,
  removeRegisteredPath,
  markSaved,
  markUnsaved,
} from './fileActions'
import {
  openFile,
  closeTabWindow,
} from './compositeFileActions'
import {
  docIdChange,
} from './editorActions'
import {
  historyIdChange,
} from './historyActions'
import {
  confirmDelete
} from './uiActions'
import {
  updateSceneName
} from './storyboardActions'

import { CONTENT_PANES } from '../constants/LayoutConstants'

function buildMetadataFilePath(filePath, rootPath) {
    return path.join(rootPath, '.deco', 'metadata', filePath.replace(rootPath, '') + '.deco')
}

export const renameFile = (oldPath, newPath) => {
  return (dispatch, getState) => {
    const unsaved = getState().directory.unsaved
    const metadataFiles = getState().metadata.liveValues.liveValuesForFile
    const rootPath = getState().directory.rootPath
    const tabs = getState().ui.tabs
    controller.run('rename', oldPath, newPath).then(() => {
      dispatch(registerPath(newPath))
      if (unsaved[oldPath]) {
        markSaved(oldPath)
        markUnsaved(newPath)
      }
      if (metadataFiles[oldPath]) {
        const oldMetadataPath = buildMetadataFilePath(oldPath, rootPath)
        const newMetadataPath = buildMetadataFilePath(newPath, rootPath)
        controller.run('rename', oldMetadataPath, newMetadataPath)
      }
      dispatch(docIdChange(oldPath, newPath))
      dispatch(historyIdChange(oldPath, newPath))

      const oldURI = URIUtils.filePathToURI(oldPath)
      const newURI = URIUtils.filePathToURI(newPath)
      dispatch(tabActions.swapAllTabsForResource(CONTENT_PANES.CENTER, oldURI, newURI))

      dispatch(removeRegisteredPath(oldPath))

      _.each(tabs, (tab) => {
        _.each(tab.groups, ({tabIds}) => {
          _.each(tabIds, (id) => {
            if (id.indexOf('.storyboard.js') != -1) {
              const oldSceneName = path.basename(oldPath, '.js')
              const newSceneName = path.basename(newPath, '.js')
              dispatch(updateSceneName(URIUtils.withoutProtocol(id), oldSceneName, newSceneName))
            }
          })
        })
      })
    })
  }
}

export const renameDir = (oldPath, newPath) => {
  return (dispatch, getState) => {
    const {filesById, unsaved, directory: {rootPath}} = getState()

    const oldMetadataPath = buildMetadataFilePath(oldPath, rootPath)
    const newMetadataPath = buildMetadataFilePath(newPath, rootPath)

    controller.run('rename', oldMetadataPath, newMetadataPath)
    controller.run('rename', oldPath, newPath).then(() => {
      _.each(filesById, (file, id) => {
        if (id.indexOf(oldPath) == 0) {
          const newSubPath = id.replace(oldPath, newPath)
          if (unsaved[id]) {
            markSaved(id)
            markUnsaved(oldPath)
          }
          dispatch(registerPath(newSubPath))
          dispatch(docIdChange(id, newSubPath))
          dispatch(historyIdChange(id, newSubPath))

          const oldURI = URIUtils.filePathToURI(id)
          const newURI = URIUtils.filePathToURI(newSubPath)
          dispatch(tabActions.swapAllTabsForResource(CONTENT_PANES.CENTER, oldURI, newURI))

          dispatch(removeRegisteredPath(id))
        }
      })
    })
  }
}

export const createFile = (filePath, content = '') => async (dispatch) => {
  await controller.run('writeFile', filePath, content)

  const parentPath = path.dirname(filePath)

  FileTreeActions.clearSelections()
  FileTreeActions.expandNode(parentPath)

  dispatch(registerPath(filePath))
}

export const createDir = (dirPath) => {
  return (dispatch, getState) => {
    controller.run('mkdir', dirPath)
  }
}

export const deleteFile = (filePath) => {
  return (dispatch, getState) => {
    dispatch(confirmDelete(filePath)).then((resp) => {
      const { shouldDelete } = resp
      if (!shouldDelete) {
        return
      }
      const unsaved = getState().directory.unsaved

      const uri = URIUtils.filePathToURI(filePath)
      dispatch(tabActions.closeAllTabsForResource(CONTENT_PANES.CENTER, uri))

      if (unsaved[filePath]) {
        dispatch(markSaved(filePath))
      }

      dispatch(removeRegisteredPath(filePath))
      controller.run('remove', filePath)

      // handle metadata
      const rootPath = getState().directory.rootPath
      const metadataPath = buildMetadataFilePath(filePath, rootPath)
      controller.run('remove', metadataPath)
    })
  }
}

export const deleteDir = (dirPath) => {
  return (dispatch, getState) => {
    const {filesById, unsaved, rootPath} = getState().directory

    dispatch(confirmDelete(dirPath)).then((resp) => {
      const {shouldDelete} = resp
      if (!shouldDelete) {
        return
      }
      controller.run('remove', dirPath)
      _.each(filesById, (file, id) => {
        if (id.indexOf(dirPath) == 0) {
          const uri = URIUtils.filePathToURI(id)
          dispatch(tabActions.closeAllTabsForResource(CONTENT_PANES.CENTER, uri))

          if (unsaved[id]) {
            dispatch(markSaved(id))
          }

          dispatch(removeRegisteredPath(id))
        }
      })

      // handle metadata
      const metadataPath = buildMetadataFilePath(dirPath, rootPath)
      controller.run('remove', metadataPath)
    })
  }
}
