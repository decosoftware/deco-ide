
import Logger from '../log/logger'

let $

try {
  // Load Obj-C bridge
  $ = require('nodobjc')

  // Load Cocoa framework
  $.framework('cocoa')
} catch (e) {
  Logger.error('Failed to load nodobjc.', e)
}

export const getBackground = () => {
  try {
    const url = $.NSWorkspace('sharedWorkspace')(
      'desktopImageURLForScreen',
      $.NSScreen('mainScreen')
    )

    return url.toString()
  } catch (e) {
    Logger.error('Failed to get desktop background image.', e)

    return null
  }
}
