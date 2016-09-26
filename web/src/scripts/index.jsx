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

import 'babel-polyfill' //use es6 runtime for promises

//for webpack hot reloader
require('../../public/main.css')

import Raven from 'raven-js';
Raven.config('https://a1ba00d4bfe94b0586811f5ffb5d0596@app.getsentry.com/64868').install()

function logException(ex, context) {
  if (!Raven) return
  Raven.captureException(ex, {
    extra: context
  });
}

import _ from 'lodash'

import React from 'react'
import { render, } from 'react-dom'

import configureStore from './store/configureStore'
import './containers'
import Root from './containers/Root/Root'

import HTML5Backend from 'react-dnd-html5-backend'
import { DragDropContext } from 'react-dnd'
const DraggableRoot = DragDropContext(HTML5Backend)(Root)

const store = configureStore()

render(
  <DraggableRoot store={store} />,
  document.getElementById('app')
)
