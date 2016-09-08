import path from 'path'
import fs from 'fs'
import electron from 'electron'
const { BrowserWindow } = electron

const REACT_EXT_PATH = '/Library/Application Support/Google/Chrome/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/0.15.4_0'

export default () => {

  // If running in dev mode on a mac
  if (global.__DEV__ && process.platform === 'darwin') {
    try {
      const installed = BrowserWindow.getDevToolsExtensions()

      // Try to install the "React Developer Tools" Chrome Extension.
      if (! installed['React Developer Tools']) {
        const reactExtensionPath = path.join(process.env.HOME, REACT_EXT_PATH)

        try {
          fs.statSync(reactExtensionPath)
        } catch (e) {
          if (e.code === 'ENOENT') {
            console.log(`Couldn't find React Developer Tools extension at ${reactExtensionPath}.`)
          }

          return
        }

        const reactExtensionName = BrowserWindow.addDevToolsExtension(reactExtensionPath)
        console.log('Successfully installed chrome extension:', reactExtensionName)
      }
    } catch (e) {
      console.log('Failed to install dev tools.')
      console.log(e)
    }
  }
}
