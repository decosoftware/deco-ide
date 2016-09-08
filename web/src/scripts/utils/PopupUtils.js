import _ from 'lodash'

let proxy = null

export default class {
  static open(url, windowOptions = {}, shouldClose) {

    // Destroy existing popup
    if (proxy && !proxy.closed) {
      proxy.close()
    }

    proxy = window.open(url, null, this.formatWindowFeatures(windowOptions))

    return new Promise((resolve, reject) => {

      // window.open doesn't fire a close event, so instead we poll
      const intervalId = setInterval(() => {
        if (proxy.closed) {
          clearInterval(intervalId)
          reject()
          return
        }

        // window is between states
        if (!proxy.location) {
          return
        }

        const result = shouldClose(proxy.location)

        if (result) {
          clearInterval(intervalId)
          proxy.close()
          resolve(result)
        }
      }, 50)
    })
  }

  // Convert an object into the window.open features string
  static formatWindowFeatures(options) {
    return _.map(options, (value, key) => {
      switch (typeof value) {
        case 'boolean': {
          return `${key}=${value ? '1' : '0'}`
        }
        default: {
          return `${key}=${value.toString()}`
        }
      }
    }).join(',')
  }
}
