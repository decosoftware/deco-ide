import $ from 'nodobjc'
import Logger from '../log/logger'

// Load Cocoa framework
$.framework('cocoa')

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
