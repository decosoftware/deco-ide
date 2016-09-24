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

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { createSelector } from 'reselect'
import { StylesEnhancer } from 'react-styles-provider'

import * as selectors from '../selectors'
import * as ContentLoader from '../api/ContentLoader'
import * as URIUtils from '../utils/URIUtils'
import HistoryMiddleware from '../middleware/editor/HistoryMiddleware'
import TokenMiddleware from '../middleware/editor/TokenMiddleware'
import ClipboardMiddleware from '../middleware/editor/ClipboardMiddleware'
import AutocompleteMiddleware from '../middleware/editor/AutocompleteMiddleware'
import IndentGuideMiddleware from '../middleware/editor/IndentGuideMiddleware'
import DragAndDropMiddleware from '../middleware/editor/DragAndDropMiddleware'
import ASTMiddleware from '../middleware/editor/ASTMiddleware'
import { editorActions, textEditorCompositeActions } from '../actions'
import { EditorDropTarget, EditorToast } from '../components'

const stylesCreator = () => ({
  editor: {
    flex: '1 1 auto',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    position: 'relative',
    overflow: 'auto',
  },
})

const mapStateToProps = (state) => createSelector(
  selectors.currentDoc,
  selectors.editorOptions,
  selectors.publishingFeature,
  ({metadata}) => metadata.liveValues.liveValuesById,
  (decoDoc, editorOptions, publishingFeature, liveValuesById) => ({
    decoDoc,
    editorOptions,
    publishingFeature,
    liveValuesById,
  })
)

const mapDispatchToProps = (dispatch) => ({
  editorActions: bindActionCreators(editorActions, dispatch),
  textEditorCompositeActions: bindActionCreators(textEditorCompositeActions, dispatch),
  dispatch,
})

@StylesEnhancer(stylesCreator)
class Editor extends Component {

  constructor(props) {
    super()

    this.state = {
      middleware: this.getMiddleware(props)
    }
  }

  componentWillMount() {
    this.ensureDoc(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.ensureDoc(nextProps)
    this.setState({
      middleware: this.getMiddleware(nextProps)
    })
  }

  ensureDoc(props) {
    const {decoDoc, fileId, editorActions} = props

    if (!decoDoc) {
      editorActions.getDocument(fileId)
    }
  }

  onImportComponent = (component) => {
    const {fileId, textEditorCompositeActions} = this.props

    textEditorCompositeActions.insertComponent(fileId, component)
  }

  getMiddleware(props) {
    const {dispatch, liveValuesById, publishingFeature} = props

    return [
      DragAndDropMiddleware(dispatch),
      HistoryMiddleware(dispatch),
      TokenMiddleware(dispatch),
      ClipboardMiddleware(dispatch, liveValuesById),
      AutocompleteMiddleware(dispatch),
      IndentGuideMiddleware(dispatch),
      ASTMiddleware(dispatch, publishingFeature),
    ]
  }

  render() {
    const {styles, decoDoc, editorOptions} = this.props
    const {middleware} = this.state

    if (!decoDoc) return null

    return (
      <EditorDropTarget
        style={styles.editor}
        decoDoc={decoDoc}
        options={editorOptions}
        middleware={middleware}
        onImportItem={this.onImportComponent}
      />
    )
  }
}

const ConnectedClass = connect(mapStateToProps, mapDispatchToProps)(Editor)

export default ConnectedClass

export const registerLoader = () => {
  ContentLoader.registerLoader({
    name: 'Text',
    id: 'com.decosoftware.text',
    filter: (uri) => uri && uri.startsWith('file://'),
    renderContent: (uri) => (
      <ConnectedClass
        fileId={uri && URIUtils.withoutProtocol(uri)}
      />
    ),
  })
}
