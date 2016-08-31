import _fs from 'fs'
import path from 'path'

import mkdirp from 'mkdirp'
import _ from 'lodash'

import fs from 'fs-plus'
import { writeFile } from '../fs/safeWriter'

import FileTreeServer from 'file-tree-server'
import transport from 'file-tree-server-transport-electron'
import electron from 'electron'

const { ipcMain, shell } = electron

import {
  onError,
  onSuccess,
} from '../actions/genericActions'

import {
  onFileData,
  onFileMetadata,
  onExternalFileData,
  confirmSave,
} from '../actions/fileActions'

import FileConstants from 'shared/constants/ipc/FileConstants'
const {
  WATCH_PATH,
  FETCH_SUB_PATH,
  WRITE_FILE_DATA,
  WRITE_FILE_METADATA,
  DELETE_FILE_METADATA,
  DELETE,
  SHOW_IN_FINDER,
  CREATE_DIRECTORY,
  RENAME,
  CREATE_FILE,
  GET_FILE_DATA,
  GET_FILE_METADATA,
  SAVE_SUCCESSFUL,
  SHARE_SAVE_STATUS,
} = FileConstants
import bridge from '../bridge'

import Logger from '../log/logger'

function verifyPayload(payload) {
  if (!payload.filePath) {
    throw 'payload path is required, but found missing'
  }

  return true
}

function createMetadataParentPath(filepath) {
  try {
    _fs.stat(path.dirname(filepath), (err) => {
      if (err) {
        //assume it's because it doesn't exist
        mkdirp(path.dirname(filepath), (err) => {
          if (err) {
            Logger.error(err)
          }
        })
      }
    })
  } catch (e) {
    Logger.error(e)
  }
}


function buildMetadataFilePath(filePath, rootPath) {
    const metadataPath = path.join(rootPath, '.deco', 'metadata', filePath.replace(rootPath, '') + '.deco')
    createMetadataParentPath(metadataPath)
    return metadataPath
}

class FileHandler {
  getWatchedPath() {
    return this._treeServer.rootPath
  }

  register() {
    bridge.on(GET_FILE_DATA, this.readFileData.bind(this))
    bridge.on(GET_FILE_METADATA, this.readFileMetadata.bind(this))
    bridge.on(WRITE_FILE_DATA, this.writeFileData.bind(this))
    bridge.on(WRITE_FILE_METADATA, this.writeFileMetadata.bind(this))
    bridge.on(SHOW_IN_FINDER, this.showInFinder.bind(this))
    bridge.on(DELETE_FILE_METADATA, this.deleteFileMetadata.bind(this))
    this._treeServer = new FileTreeServer(transport(ipcMain), path.resolve('~/'))
  }

  readFileData(payload, respond) {
    try {
      verifyPayload(payload)
      const filePath = payload.filePath
      fs.readFile(filePath, (err, data) => {
        if (err) {
          respond(onError(err))
        } else {
          respond(onFileData(filePath, data.toString('utf8')))
        }
      })
    } catch(e) {
      Logger.error(e)
    }
  }


  showInFinder(payload, respond) {
    try {
      shell.showItemInFolder(payload.filePath)
    } catch (e) {
      Logger.error(e)
    }
    respond(onSuccess(SHOW_IN_FINDER))
  }

  writeFileData(payload, respond) {
    try {
      if (!payload.filePath) {
        respond(onError('incorrect payload format'))
      }
      writeFile(payload.filePath, payload.data, (err) => {
        if (err) {
          Logger.error(err)
          respond(onError(err))
          return
        }        
        respond(onSuccess(WRITE_FILE_DATA))
        bridge.send(confirmSave(payload.filePath))
      })
    } catch(e) {
      Logger.error(e)
    }
  }

  writeFileMetadata(payload, respond) {
    try {
      if (!payload.filePath) {
        respond(onError('incorrect payload format'))
      }
      const absolutePath = buildMetadataFilePath(payload.filePath, payload.rootPath)
      writeFile(absolutePath, payload.metadata, (err) => {
        if (err) {
          Logger.error(err)
          respond(onError(err))
          return
        }
        respond(onSuccess(WRITE_FILE_METADATA))
        bridge.send(confirmSave(payload.filePath))
      })
    } catch(e) {
      Logger.error(e)
    }
  }

  deleteFileMetadata(payload, respond) {
    try {
      if (!payload.filePath) {
        respond(onError('incorrect payload format'))
      }
      const absolutePath = buildMetadataFilePath(payload.filePath, payload.rootPath)
      fs.unlink(absolutePath, (err) => {
        if (err) {
          Logger.error(err)
          respond(onError(err))
          return
        }
        respond(onSuccess(DELETE_FILE_METADATA))
      })
    } catch(e) {
      Logger.error(e)
    }
  }

  readFileMetadata(payload, respond) {
    try {
      verifyPayload(payload)
      payload.filePath = buildMetadataFilePath(payload.filePath, payload.rootPath)
      const filePath = payload.filePath
      if (!payload) return
      fs.readFile(filePath, (err, data) => {
        if (err) {
          respond(onError(err))
        } else {
          respond(onFileMetadata(filePath, data.toString('utf8')))
        }
      })
    } catch(e) {
      Logger.error(e)
    }
  }
}

const handler = new FileHandler()
export default handler
