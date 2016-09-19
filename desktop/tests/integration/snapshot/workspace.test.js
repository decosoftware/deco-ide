import hooks from '../support/hooks'
import snapshotHooks from './support/hooks'
import { expectToMatchSnapshot } from './support/utils'


describe('Workspace', function() {
  beforeEach(hooks.beforeEachNewProject)

  afterEach(snapshotHooks.afterEachSnapshot)

  it('opens with a new project', function(done) {
    this.snapshotTolerance = 0.003

    expectToMatchSnapshot(this, done)
  })
})
