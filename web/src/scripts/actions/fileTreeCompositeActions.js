const remote = Electron.remote;
const path = remote.require('path')

import { fileTreeController as controller } from '../filetree'
import FileTreeActions from '../filetree/actions'

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
  closeTab,
  swapTab,
} from './tabActions'
import {
  historyIdChange,
} from './historyActions'
import {
  confirmDelete
} from './uiActions'

import { CONTENT_PANES } from '../constants/LayoutConstants'

function buildMetadataFilePath(filePath, rootPath) {
    return path.join(rootPath, '.deco', 'metadata', filePath.replace(rootPath, '') + '.deco')
}

export const renameFile = (oldPath, newPath) => {
  return (dispatch, getState) => {
    const unsaved = getState().directory.unsaved
    const metadataFiles = getState().metadata.liveValues.liveValuesForFile
    const rootPath = getState().directory.rootPath
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
      dispatch(swapTab(CONTENT_PANES.CENTER, oldPath, newPath))
      dispatch(removeRegisteredPath(oldPath))
    })
  }
}

export const renameDir = (oldPath, newPath) => {
  return (dispatch, getState) => {
    // current files
    const filesById = getState().directory.filesById
    const unsaved = getState().directory.unsaved
    const currentTabs = getState().ui.tabs.CENTER || {tabIds: []}
    const rootPath = getState().directory.rootPath
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
          dispatch(swapTab(CONTENT_PANES.CENTER, id, newSubPath))
          dispatch(removeRegisteredPath(id))
        }
      })
    })
  }
}

export const createFile = (filePath, content = '') => {
  return (dispatch, getState) => {
    controller.run('writeFile', filePath, content).then(() => {
      FileTreeActions.clearSelections()
      const parentPath = path.dirname(filePath)
      FileTreeActions.expandNode(parentPath)
      dispatch(openFile(filePath))
    })
  }
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
      dispatch(closeTabWindow(filePath))
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
    const filesById = getState().directory.filesById
    const unsaved = getState().directory.unsaved
    const currentTabs = getState().ui.tabs.CENTER || { tabIds: [] }
    const rootPath = getState().directory.rootPath

    dispatch(confirmDelete(dirPath)).then((resp) => {
      const { shouldDelete } = resp
      if (!shouldDelete) {
        return
      }
      controller.run('remove', dirPath)
      _.each(filesById, (file, id) => {
        if (id.indexOf(dirPath) == 0) {
          if (currentTabs.tabIds.indexOf(id) != -1) {
            dispatch(closeTabWindow(id))
          }
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
