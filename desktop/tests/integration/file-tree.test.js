import fs from 'fs'
import path from 'path'
import { expect } from 'chai'

import hooks from './support/hooks'
import { fileExistsInHomeDir, hoverOverElement } from './support/utils'


describe('File tree', function() {
  beforeEach(hooks.beforeEachNewProject)

  afterEach(hooks.afterEach)

  it('creates a new file', function() {
    const client = this.app.client

    return hoverOverElement('.project-navigator .Grid__cell div div', client)
      .then(() => expect(client.isExisting('.icon-plus')).to.eventually.be.true)
      .then(() => client.click('.icon-plus'))
      .then(() => client.click('div=New File'))
      .then(() => expect(client.isExisting('#naming-banner')).to.eventually.be.true)
      .then(() => client.setValue('#naming-banner input', 'foo.js'))
      .then(() => client.submitForm('#naming-banner input'))
      .then(() => expect(fileExistsInHomeDir('.Deco/tmp/Project/foo.js')).to.be.true)
      .then(() => expect(client.isExisting('#tabbed-editor [title="foo.js"]')).to.eventually.be.true)
  })
})
