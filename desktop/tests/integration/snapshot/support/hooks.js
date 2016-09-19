import hooks from '../../support/hooks'
import { tearDown } from './utils'


export default {
  afterEachSnapshot() {
    return hooks.afterEach.call(this).then(() => tearDown(this))
  },
}
