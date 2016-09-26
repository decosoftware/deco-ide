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
    this.state = {
      linkedDoc: this.getLinkedDoc(props.decoDoc)
    }
  }

  getLinkedDoc(decoDoc) {
    if (decoDoc) {
      return decoDoc.getLinkedDoc()
    }
  }

  releaseLinkedDoc(decoDoc, linkedDoc) {
    if (decoDoc) {
      decoDoc.releaseLinkedDoc(linkedDoc)
    }
  }

  focus() {
    if (this.props.decoDoc && this.props.decoDoc.cmDoc) {
      this.props.decoDoc.cmDoc.cm.focus()
    } else {
      ReactDOM.findDOMNode(this.refs.codemirror.refs.codemirror).focus()
    }
  }

  componentWillReceiveProps(nextProps) {
    const {decoDoc: prevDoc} = this.props
    const {decoDoc: nextDoc} = nextProps

    this.detachMiddleware(this.props.middleware)
    this.attachMiddleware(nextProps.middleware, nextDoc)

    if (nextDoc !== prevDoc) {
      if (prevDoc) {
        this.releaseLinkedDoc(prevDoc, this.state.linkedDoc)
        this.setState({
          linkedDoc: undefined
        })
      }

      if (nextDoc) {
        this.setState({
          linkedDoc: this.getLinkedDoc(nextDoc)
        })
      }
    }
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
    const {className, style, middleware, decoDoc, options} = this.props

    const eventListeners = _.map(middleware, 'eventListeners')
    const linkedDoc = decoDoc && decoDoc.getLinkedDoc()

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
