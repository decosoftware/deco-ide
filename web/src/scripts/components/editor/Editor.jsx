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

'use strict'

import React, { Component, } from 'react'
import ReactDOM from 'react-dom'
import _ from 'lodash'
import CodeMirrorComponent from './CodeMirrorComponent'

class Editor extends Component {
  constructor(props) {
    super(props)
    this.attachMiddleware(props.middleware, props.decoDoc)
  }

  focus() {
    if (this.props.decoDoc && this.props.decoDoc.cmDoc) {
      this.props.decoDoc.cmDoc.cm.focus()
    } else {
      ReactDOM.findDOMNode(this.refs.codemirror.refs.codemirror).focus()
    }
  }

  componentWillReceiveProps(newProps, newState) {
    this.detachMiddleware(this.props.middleware)
    this.attachMiddleware(newProps.middleware, newProps.decoDoc)
  }

  componentWillUnmount() {
    this.detachMiddleware(this.props.middleware)
  }

  attachMiddleware(middleware, decoDoc) {
    _.invokeMap(middleware, 'attach', decoDoc)
  }

  detachMiddleware(middleware) {
    _.invokeMap(middleware, 'detach')
  }

  //RENDER METHODS
  render() {
    const eventListeners = _.map(this.props.middleware, 'eventListeners')

    return (
      <CodeMirrorComponent
        style={this.props.style}
        ref='codemirror'
        doc={this.props.decoDoc && this.props.decoDoc.cmDoc}
        options={this.props.options}        
        eventListeners={eventListeners}
        className={this.props.className}/>
    )
  }
}

Editor.defaultProps = {
  middleware: [],
}

export default Editor
