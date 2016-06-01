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

'use strict'

import _fs from 'fs'
import child_process from 'child_process'
import path from 'path'

import mkdirp from 'mkdirp'
import _ from 'lodash'
import sane from 'sane'

import { shell } from 'electron'

import fs from 'fs-plus'
import FileSystem from '../fs/fileSystem'
import bridge from '../bridge'
import {
  onFileCreated,
  addSubPath,
  addSubPathBatch,
  onRename,
  onCreateDirectory,
  onCreateFile,
  onFileData,
  onFileMetadata,
  confirmSave,
  onExternalFileData,
  removeSubPath,
  removeSubPathBatch,
} from '../actions/fileActions'

import {
  onError,
  onSuccess,
} from '../actions/genericActions'

import ErrorConstants from 'shared/constants/ipc/ErrorConstants'
const { ERROR, } = ErrorConstants

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

import Logger from '../log/logger'

let _watcher = null
let watchedPath = null

const pathList = {}

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
  const metadataPath = path.join(formatPayloadPath(rootPath), '.deco', formatPayloadPath(filePath).replace(rootPath, '') + '.deco')
  createMetadataParentPath(metadataPath)
  return metadataPath
}

function shouldEmitChangesForPath(filePath) {
  if (path.extname(filePath) === '.deco') {
    return false
  }

  if (path.basename(filePath) === '.deco') {
    return false
  }

  return true
}

function closeWatchman() {
  if (!_watcher) return
  try {
    _watcher.close()
  } catch(e) {
    Logger.error(e)
  }
}

function shutdownWatchman() {
  try {
    // this should only be the case if we added watchman to the $PATH on initialization
    if (process.env.PATH.indexOf('/usr/local/Deco/watchman') != -1) {
      child_process.spawnSync('/usr/local/Deco/watchman/watchman', ['shutdown-server'])
    }
  } catch (e) {
    //do nothing
    Logger.error(e)
  }
}

process.on('exit', () => {
  closeWatchman()
  shutdownWatchman()
})

process.on('SIGTERM', () => {
  closeWatchman()
  shutdownWatchman()
})

function buildPathObjects(absolutePath) {
  const buffer = new Buffer(absolutePath)
  const id = buffer.toString('hex')
  const baseName = path.basename(absolutePath)
  const pathArray = absolutePath.split(path.sep)
  //slice the first argument which is
  return {
    absolutePathArray: pathArray.slice(1, pathArray.length),
    baseName: baseName,
    id: id,
  }
}

function getPathFromId(id) {
  const buf = new Buffer(id, 'hex')
  return buf.toString()
}

function verifyPayload(payload) {
  if (!payload.path) {
    throw 'payload path is required, but found missing'
  }

  return true
}

function formatPayloadPath(payloadPath) {
  //assuming its an array, shipped back from renderer
  if (typeof payloadPath != 'string') {
    return [''].concat(payloadPath).join(path.sep)
  }
  return payloadPath
}

class FileHandler {

  getWatchedPath() {
    return watchedPath
  }

  register() {
    bridge.on(WATCH_PATH, this.watchPath.bind(this))
    bridge.on(FETCH_SUB_PATH, this.asyncListSubPaths.bind(this))
    bridge.on(WRITE_FILE_DATA, this.writeFileData.bind(this))
    bridge.on(WRITE_FILE_METADATA, this.writeFileMetadata.bind(this))
    bridge.on(DELETE_FILE_METADATA, this.deleteFileMetadata.bind(this))
    bridge.on(DELETE, this.delete.bind(this))
    bridge.on(SHOW_IN_FINDER, this.showInFinder.bind(this))
    bridge.on(CREATE_DIRECTORY, this.createDirectory.bind(this))
    bridge.on(RENAME, this.rename.bind(this))
    bridge.on(CREATE_FILE, this.createFile.bind(this))
    bridge.on(GET_FILE_DATA, this.readFileData.bind(this))
    bridge.on(GET_FILE_METADATA, this.readFileMetadata.bind(this))
  }


  createFile(payload, respond) {
    try {
      const absolutePath = getPathFromId(payload.id)
      //absolute path is that of the parent directory
      const filePath = path.join(absolutePath, payload.filename)
      _fs.writeFile(filePath, payload.data, {
        mode: '0755'
      }, (err) => {
        if (err) {
          Logger.error(err)
          respond(onError('Failed to create new file'))
          return
        }
        const pathObj = buildPathObjects(filePath)
        respond(onFileCreated(pathObj, payload.data))
      })
    } catch (e) {

    }
  }

  rename(payload, respond) {
    try {
      const absolutePath = getPathFromId(payload.id)
      const newPath = path.join(path.dirname(absolutePath), payload.newName)
      if (!fs.isDirectorySync(absolutePath)) {
        try {
          const possibleMetadata = absolutePath + '.deco'
          if (fs.existsSync(possibleMetadata)) {
            fs.moveSync(possibleMetadata, newPath + '.deco')
          }
        } catch (e) {
          Logger.error(e)
        }
      }
      fs.moveSync(absolutePath, newPath)
      const pathObj = buildPathObjects(newPath)
      respond(onRename(pathObj))
    } catch (e) {
      Logger.error(e)
      respond(onError('Rename operation was unsuccessful'))
    }
  }

  delete(payload, respond) {
    try {
      const absolutePath = getPathFromId(payload.id)
      if (payload.fileType == 'dir') {
        // FileSystem.deleteDirectoryRecursivelySync(absolutePath)
        child_process.exec('rm -r ' + absolutePath)
      } else {
        _fs.unlink(absolutePath, (err) => {
          if (err) {
            Logger.error(err)
          }
        })
        const possibleMetadata = absolutePath + '.deco'
        try {
          if (fs.existsSync(possibleMetadata)) {
            _fs.unlink(absolutePath, (err) => {
              if (err) {
                Logger.error(err)
              }
            })
          }
        } catch (e) {
          Logger.error(e)
        }
      }
    } catch (e) {
      Logger.error(e)
    }
    respond(onSuccess(DELETE))
  }

  showInFinder(payload, respond) {
    try {
      const absolutePath = getPathFromId(payload.id)
      Logger.error(absolutePath)
      shell.showItemInFolder(absolutePath)
    } catch (e) {
      Logger.error(e)
    }
    respond(onSuccess(SHOW_IN_FINDER))
  }

  createDirectory(payload, respond) {
    try {
      const absolutePath = getPathFromId(payload.id)
      const newPath = path.join(absolutePath, payload.dirname)
      _fs.mkdir(newPath, (err) => {
        if (err) {
          Logger.error(err)
        }
      })
    } catch (e) {
      Logger.error(e)
    }
    respond(onSuccess(CREATE_DIRECTORY))
  }

  readFileData(payload, respond) {
    try {
      verifyPayload(payload)
      payload.path = formatPayloadPath(payload.path)
      if (!payload) return
      FileSystem.readFile(payload.path, {
        success: (data) => {
          const pathObj = buildPathObjects(payload.path)
          pathList[payload.path] = true
          respond(onFileData(pathObj, data.toString('utf8')))
        }, error: (err) => {
          respond(onError(err))
        },
      })
    } catch(e) {
      Logger.error(e)
    }
  }

  readFileMetadata(payload, respond) {
    try {
      verifyPayload(payload)
      payload.path = buildMetadataFilePath(getPathFromId(payload.path), payload.rootPath)
      if (!payload) return
      FileSystem.readFile(payload.path, {
        success: (data) => {
          const pathObj = buildPathObjects(payload.path)
          pathList[payload.path] = true
          respond(onFileMetadata(pathObj, data.toString('utf8')))
        }, error: (err) => {
          respond(onError(err))
        },
      })
    } catch(e) {
      Logger.error(e)
    }
  }

  writeFileData(payload, respond) {
    try {
      if (!payload.id) return
      const absolutePath = getPathFromId(payload.id)
      FileSystem.writeFile(absolutePath, payload.data, {
        success: () => {
          respond(onSuccess(WRITE_FILE_DATA))
          bridge.send(confirmSave(payload.id))
        }, error: (err) => {
          Logger.error(err)
          respond(onError(err))
          return
        }
      })
    } catch(e) {
      Logger.error(e)
    }
  }

  writeFileMetadata(payload, respond) {
    try {
      if (!payload.id) return
      const absolutePath = buildMetadataFilePath(getPathFromId(payload.id), payload.rootPath)
      FileSystem.writeFile(absolutePath, payload.metadata, {
        success: () => {
          respond(onSuccess(WRITE_FILE_METADATA))
          bridge.send(confirmSave(payload.id))
        }, error: (err) => {
          Logger.error(err)
          respond(onError(err))
          return
        }
      })
    } catch(e) {
      Logger.error(e)
    }
  }

  deleteFileMetadata(payload, respond) {
    try {
      if (!payload.id) return
      const absolutePath = buildMetadataFilePath(getPathFromId(payload.id), payload.rootPath)
      FileSystem.deleteFile(absolutePath, {
        success: () => {
          respond(onSuccess(DELETE_FILE_METADATA))
        }, error: (err) => {
          Logger.error(err)
          respond(onError(err))
        }
      })
    } catch(e) {
      Logger.error(e)
    }
  }

  watchPath(payload, respond) {

    const rootPath = payload.rootPath
    watchedPath = rootPath
    let removeQueue = []
    const _batchRemoval = _.debounce(() => {
      bridge.send(removeSubPathBatch(removeQueue.slice()))
      removeQueue = []
    }, 1000)

    try {
      _watcher = sane(rootPath, {
        watchman: true,
      })

      _watcher.on('error', (error) => {
        Logger.error(error)
        //try to relaunch every 10sec
        setTimeout(this.watchPath.bind(this, { rootPath, }, () => {
          return //just pass mock callback
        }), 10000)
      })

      _watcher.on('add', (filepath, root, stat) => {
        if (! shouldEmitChangesForPath(filepath)) {
          return
        }

        const absolutePath = path.join(root, filepath)
        if (pathList[path.dirname(absolutePath)]) {
          this.asyncListSubPaths({ path: absolutePath, isCollapsed: true }, (resp) => {
            if (resp.type != ERROR) {
              bridge.send(resp)
            }
          })
        }
      })
      _watcher.on('change', (filepath, root, stat) => {
        if (! shouldEmitChangesForPath(filepath)) {
          return
        }

        const absolutePath = path.join(root, filepath)
        if (!fs.isDirectorySync(absolutePath)) {
          if (pathList[absolutePath]) {
            //TODO at the moment, we cannot update code if changed externally
          }
        }
      })
      _watcher.on('delete', (filepath, root, stat) => {
        if (! shouldEmitChangesForPath(filepath)) {
          return
        }

        const absolutePath = path.join(root, filepath)
        if (pathList[root]) {
          this.asyncRemoveSubPaths({ path: absolutePath, }, (resp) => {
            if (resp.type != ERROR) {
              removeQueue.push(resp)
              _batchRemoval()
            }
          })
        }
      })
    } catch (e) {
      Logger.error(e)
      respond(onError(WATCH_PATH))
      return
    }

    respond(onSuccess(WATCH_PATH))
  }

  asyncRemoveSubPaths(payload, respond) {
    try {
      verifyPayload(payload)
      payload.path = formatPayloadPath(payload.path)
      // remove if path exists
      // this function may also be called from renderer as a command to delete
      // or it may be called as a response to cleanup from an external remove
      if (fs.existsSync(payload.path)) {
        fs.removeSync(payload.path)
      }

      if (pathList[payload.path]) {
        delete pathList[payload.path]
      }
      const pathObject = buildPathObjects(payload.path)
      respond(removeSubPath(pathObject))

    } catch(e) {
      Logger.error(e)
    }
  }

  _asyncListDir(parentId, absolutePath, queue, respond) {
    //function returns falsy if the directory is not entered
    //this happens if an empty directory is being listed
    return fs.traverseTree(absolutePath,
      (filePath) => {
        if (! shouldEmitChangesForPath(filePath)) {
          return
        }

        const pathObject = buildPathObjects(filePath)
        queue.push(addSubPath(pathObject, 'file'))
        // FileBridge.queueSubPathBatch(pathObject, 'file', queue)
      },
      (directoryPath) => {
        if (! shouldEmitChangesForPath(directoryPath)) {
          return
        }
        const pathObject = buildPathObjects(directoryPath)
        queue.push(addSubPath(pathObject, 'dir'))
        return false
      }, () => {
        respond(addSubPathBatch(queue))
      })
  }

  asyncListSubPaths(payload, respond) {
    try {
      verifyPayload(payload)
      payload.path = formatPayloadPath(payload.path)
      if (!payload) return // TODO: this will error. what's intended?

      if (! shouldEmitChangesForPath(payload.path)) {
        return
      }

      const pathObj = buildPathObjects(payload.path)
      if (fs.isDirectorySync(payload.path)) {
        const queue = []
        queue.push(addSubPath(pathObj, 'dir'))
        if (!payload.isCollapsed) {
          pathList[payload.path] = true
        }
        if (!this._asyncListDir(pathObj.id, payload.path, queue, respond)) {
          // this case handles when an empty directory is queued
          // TODO bridge??
          bridge.send(addSubPathBatch(queue))
        }
      } else {
        respond(addSubPathBatch([
          addSubPath(pathObj, 'file')
        ]))
      }
    } catch(e) {
      Logger.error(e)
    }
  }
}

const handler = new FileHandler()
export default handler
