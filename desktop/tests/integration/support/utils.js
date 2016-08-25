import fs from 'fs'
import path from 'path'


export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function makePrimaryDisplayFullScreen(app) {
  return app.electron.screen.getPrimaryDisplay().then((disp) => {
    const {width, height} = disp.workAreaSize
    return app.browserWindow.setSize(width, height)
  })
}

// Replacement for moveToObject which doesn't seem to work
export function hoverOverElement(selector, client) {
  return client.selectorExecute(selector, function(nodes) {
    nodes[0].dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
  })
}

export function fileExistsInHomeDir(relativePath) {
  return fs.statSync(path.join(process.env.HOME, relativePath)).isFile()
}
