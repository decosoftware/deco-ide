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

import React, { Component, } from 'react'
import {
  Router,
  hashHistory,
  Route,
  IndexRoute,
} from 'react-router'

const Buffer = Electron.remote.getGlobal('Buffer')

import App from '../App'
import Workspace from '../Workspace'
import Landing from '../Landing'
import Preferences from '../Preferences'
import Error from '../Error'
import Upgrader from '../Upgrader'

import { setTopDir, } from '../../actions/fileActions'
import { scanLocalRegistries } from '../../actions/moduleActions'
import { initializeProcessesForDir, } from '../../actions/applicationActions'

const _GA = (screenName) => {
  ga('send', 'screenview', {
    screenName: screenName,
  })
}

class AppRouter extends Component {

  componentWillMount() {

    // Fires regardless of whether the pathname differs. Necessary since
    // creating a new project will not change the pathname or fire onEnter
    // if we're already in a new project.
    this._stopListening = hashHistory.listen((params) => {
      const match = params.pathname.match(/\/workspace\/(.*)?/)
      if (match && match[1]) {
        const hexString = new Buffer(match[1], 'hex')
        const path = hexString.toString('utf8')
        this.props.store.dispatch(setTopDir(path))
        this.props.store.dispatch(scanLocalRegistries(path))
        this.props.store.dispatch(initializeProcessesForDir(path))
      }
    })
  }

  componentWillUnmount() {
    this._stopListening()
  }

  render() {
    return (
      <Router history={hashHistory}>
        <Route
          path='/'
          component={App}>
          <IndexRoute
            component={Landing}
            onEnter={() => {
              _GA('Landing')
            }}/>
          <Route
             path='upgrading'
             component={Upgrader}
             onEnter={() => {
               _GA('Upgrading')
             }}/>
          <Route
            path='error'
            component={Error}
            onEnter={() => {
              _GA('Error')
            }}/>
          <Route
            path='preferences'
            component={Preferences}
            onEnter={() => {
              _GA('Preferences')
            }}/>
          <Route
            path='workspace/(:path)'
            component={Workspace}
            onEnter={() => {
              _GA('Project')
            }} />
        </Route>
      </Router>
    )
  }
}

export default AppRouter
