import { expect } from 'chai'

import hooks from './support/hooks'


describe('Toolbar', function() {
  beforeEach(hooks.beforeEachNewProject)

  afterEach(hooks.afterEach)

  it('opens and closes the project navigator', function() {
    const client = this.app.client
    return Promise.resolve()
      .then(() => expect(client.isExisting('.project-navigator')).to.eventually.be.true)
      .then(() => client.click('#project-btn'))
      .then(() => expect(client.isExisting('.project-navigator')).to.eventually.be.false)
      .then(() => client.click('#project-btn'))
      .then(() => expect(client.isExisting('.project-navigator')).to.eventually.be.true)
  })

  it('opens and closes the console', function() {
    const client = this.app.client
    return client.click('#console-btn')
      .then(() => expect(client.isExisting('.open-term')).to.eventually.be.true)
      .then(() => expect(client.isExisting('.close-term')).to.eventually.be.false)
      .then(() => client.click('#console-btn'))
      .then(() => expect(client.isExisting('.open-term')).to.eventually.be.false)
      .then(() => expect(client.isExisting('.close-term')).to.eventually.be.true)
  })

  it('opens and closes the simulator', function() {
    const client = this.app.client
    return client.click('#simulator-btn')
      .then(() => expect(client.isExisting('#simulator-menu')).to.eventually.be.true)
      .then(() => client.leftClick('#simulator-btn', 10, 10)) // aim carefully to avoid clicking the popover
      .then(() => expect(client.isExisting('#simulator-menu')).to.eventually.be.false)
  })
})
