import electron from 'electron-prebuilt'
import { Application } from 'spectron'

import { makePrimaryDisplayFullScreen } from './utils'


function beforeEach() {
  this.timeout(10000)
  this.app = new Application({
    path: electron,
    args: ['./package/build/main'],
    startTimeout: 10000,
    waitTimeout: 10000,
  })

  return this.app.start()
    .then(() => this.app.client
      .timeoutsImplicitWait(2000)
      .localStorage('DELETE')
      .waitUntilWindowLoaded()
      .windowByIndex(1)) // switch from the preferences window to the main window
}

export default {
  beforeEach,

  beforeEachNewProject() {
    return beforeEach.call(this)
      .then(() => this.app.client.click('#new-project'))
      .then(() => makePrimaryDisplayFullScreen(this.app))
  },

  afterEach() {
    this.timeout(10000)
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  },
}
