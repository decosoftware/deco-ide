const ipc = Electron.ipcRenderer
import FileTreeClient from 'file-tree-client'
import transport from 'file-tree-client-transport-electron'

export const fileTreeController = new FileTreeClient(transport(ipc))

import select from './plugins/select'
import expand from './plugins/expand'
import context from './plugins/context'

export const PLUGINS = [select, expand, context]
