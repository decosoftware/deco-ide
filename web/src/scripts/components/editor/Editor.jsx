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

    this.state = {
      linkedDoc: this.createLinkedDoc(props.decoDoc)
    }

    this.attachMiddleware(props.middleware, props.decoDoc, this.state.linkedDoc)
  }

  createLinkedDoc(decoDoc) {
    if (decoDoc) {
      return decoDoc.createLinkedDoc()
    }
  }

  releaseLinkedDoc(decoDoc, linkedDoc) {
    if (decoDoc) {
      decoDoc.releaseLinkedDoc(linkedDoc)
    }
  }

  focus() {
    const {linkedDoc} = this.state

    if (linkedDoc) {
      linkedDoc.cm.focus()
    } else {
      ReactDOM.findDOMNode(this.refs.codemirror.refs.codemirror).focus()
    }
  }

  getCurrentDoc() {
    return this.state.linkedDoc
  }

  componentWillReceiveProps(nextProps) {
    const {decoDoc: prevDoc} = this.props
    const {decoDoc: nextDoc} = nextProps
    let {linkedDoc} = this.state

    if (nextDoc !== prevDoc) {
      if (prevDoc) {
        this.releaseLinkedDoc(prevDoc, this.state.linkedDoc)
      }

      if (nextDoc) {
        linkedDoc = this.createLinkedDoc(nextDoc)
      }

      this.setState({linkedDoc})
    }

    this.detachMiddleware(this.props.middleware)
    this.attachMiddleware(nextProps.middleware, nextDoc, linkedDoc)
  }

  componentWillUnmount() {
    this.detachMiddleware(this.props.middleware)
  }

  attachMiddleware(middleware, decoDoc, linkedDoc) {
    _.invokeMap(middleware, 'attach', decoDoc, linkedDoc)
  }

  detachMiddleware(middleware) {
    _.invokeMap(middleware, 'detach')
  }

  //RENDER METHODS
  render() {
    const {className, style, middleware, decoDoc, options} = this.props
    const {linkedDoc} = this.state

    const eventListeners = _.map(middleware, 'eventListeners')

    return (
      <CodeMirrorComponent
        style={style}
        ref={'codemirror'}
        doc={linkedDoc}
        options={options}
        eventListeners={eventListeners}
        className={className}
      />
    )
  }
}

Editor.defaultProps = {
  middleware: [],
}

export default Editor
