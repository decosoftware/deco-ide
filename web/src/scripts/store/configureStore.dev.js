/**
 *    Copyright (C) 2015 Deco Software Inc.
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Affero General Public License, version 3,
 *    as published by the Free Software Foundation.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import { createStore, applyMiddleware, compose } from 'redux'
import { syncHistory } from 'react-router-redux'
import { hashHistory } from 'react-router'
import thunk from 'redux-thunk'
import { batchedSubscribe, batchMiddleware } from 'redux-batched-subscribe'
import { unstable_batchedUpdates as batchedUpdates } from 'react-dom'

import rootReducer from '../reducers'
import loggingMiddleware from './loggingMiddleware'
import ipcActionEmitter from '../ipc/ipcActionEmitter'
import fileTreeActionEmitter from '../ipc/fileTreeActionEmitter'
import preferencesActionEmitter from '../persistence/preferencesActionEmitter'
import layoutActionEmitter from '../persistence/layoutActionEmitter'
import moduleActionEmitter from '../persistence/moduleActionEmitter'
import { storeEnhancer as contentLoader } from '../api/ContentLoader'
import applyActionEmitters from './applyActionEmitters'

//DEV
import DevTools from '../containers/DevTools'

const enhancer = compose(
  applyMiddleware(batchMiddleware, thunk, syncHistory(hashHistory), loggingMiddleware),
  DevTools.instrument(),
  batchedSubscribe(batchedUpdates)
)

function getDebugSessionKey() {
  // By default we try to read the key from ?debug_session=<key> in the address bar
  return 'deco-debug'
}

export default function configureStore() {
  const store = createStore(rootReducer, enhancer)

  applyActionEmitters(store)(
    ipcActionEmitter,
    fileTreeActionEmitter,
    preferencesActionEmitter,
    layoutActionEmitter,
    moduleActionEmitter,
    contentLoader
  )
  reduxRouterMiddleware.listenForReplays(store)

  // Hot reload reducers (requires Webpack or Browserify HMR to be enabled)
  if (module.hot) {
    module.hot.accept('../reducers', () =>
      store.replaceReducer(require('../reducers')/*.default if you use Babel 6+ */)
    )
  }

  return store
}
