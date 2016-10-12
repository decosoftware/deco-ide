
import Logger from '../log/logger'
const {nativeImage} = require('electron')

let $

try {
  // Load Obj-C bridge
  $ = require('nodobjc')

  // Load Cocoa framework
  $.framework('cocoa')
} catch (e) {
  Logger.error('Failed to load nodobjc.', e)
}

export const getBackgroundImageURL = () => {
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

export const getBackgroundImage = () => {
  let url = getBackgroundImageURL()

  if (!url) return null

  // Decode the url and strip the file:// protocol
  const filepath = decodeURI(url).replace(/^file:\/\//, '')

  try {
    const image = nativeImage.createFromPath(filepath)

    // Arbitrarily scale to 512 wide. Since this image will be heavily blurred,
    // the quality of the image is not important.
    const scaled = image.resize({width: 512, quality: 'good'})

    return scaled.toDataURL()
  } catch (e) {
    Logger.error(`Failed to create nativeImage from desktop background ${url}.`, e)

    return null
  }
}
