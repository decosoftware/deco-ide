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
import { tabActions, editorActions, textEditorCompositeActions } from '../actions'
import { EditorDropTarget, EditorToast, Minimap } from '../components'
import { CONTENT_PANES } from '../constants/LayoutConstants'

const getMinimapWidth = (width) => Math.floor(width * 0.1)

const stylesCreator = (theme, {width}) => ({
  container: {
    flex: '1 1 auto',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    position: 'relative',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  editor: {
    flex: '1 1 auto',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    position: 'relative',
    overflow: 'auto',
  },
  minimap: {
    flex: `0 0 ${getMinimapWidth(width)}px`,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'stretch',
  },
})

const mapStateToProps = (state, props) => createSelector(
  selectors.docByFileId,
  selectors.editorOptions,
  selectors.publishingFeature,
  selectors.showMinimap,
  ({metadata}) => metadata.liveValues.liveValuesById,
  (decoDoc, editorOptions, publishingFeature, showMinimap, liveValuesById) => ({
    decoDoc,
    editorOptions,
    publishingFeature,
    showMinimap,
    liveValuesById,
  })
)

const mapDispatchToProps = (dispatch) => ({
  tabActions: bindActionCreators(tabActions, dispatch),
  editorActions: bindActionCreators(editorActions, dispatch),
  textEditorCompositeActions: bindActionCreators(textEditorCompositeActions, dispatch),
  dispatch,
})

@StylesEnhancer(stylesCreator, ({width}) => ({width}))
class Editor extends Component {

  constructor(props) {
    super()

    this.state = {
      middleware: this.getMiddleware(props),
      scrollToLine: null,
    }
  }

  componentWillMount() {
    this.ensureDoc(this.props)
  }

  componentDidMount() {
    const {focused} = this.props

    focused && this.focus()
  }

  componentWillReceiveProps(nextProps) {
    this.ensureDoc(nextProps)
    this.setState({
      middleware: this.getMiddleware(nextProps)
    })
  }

  componentDidUpdate(prevProps) {
    const {focused, decoDoc} = this.props

    const focusChanged = !prevProps.focused && focused
    const docChanged = decoDoc && decoDoc !== prevProps.decoDoc

    if (focusChanged || (docChanged && focused)) {
      this.focus()
    }
  }

  focus() {
    const {editor} = this.refs
    editor && editor.decoratedComponentInstance.focus()
  }

  ensureDoc(props) {
    const {decoDoc, fileId, editorActions} = props

    if (!decoDoc) {
      editorActions.getDocument(fileId)
    }
  }

  onScrollToLine = (scrollToLine) => this.setState({scrollToLine})

  onFocus = () => {
    const {uri, tabContainerId, tabGroupIndex, tabActions} = this.props

    tabActions.focusTab(tabContainerId, uri, tabGroupIndex)
  }

  onImportComponent = (component, linkedDocId) => {
    const {fileId, textEditorCompositeActions} = this.props

    textEditorCompositeActions.insertComponent(fileId, linkedDocId, component)
  }

  getMiddleware(props) {
    const {dispatch, liveValuesById, publishingFeature, editorOptions} = props

    const middleware = [
      new DragAndDropMiddleware(),
      new HistoryMiddleware(),
      new TokenMiddleware(),
      new AutocompleteMiddleware(),

      editorOptions.showIndentGuides && new IndentGuideMiddleware(),

      // Use ASTMiddleware only in new static analysis mode
      publishingFeature && new ASTMiddleware(),

      // Use ClipboardMiddleware only in legacy live value mode
      !publishingFeature && new ClipboardMiddleware().setLiveValuesById(liveValuesById),

    ].filter(x => !!x)

    middleware.forEach(m => m.setDispatchFunction(dispatch))

    return middleware
  }

  render() {
    const {styles, decoDoc, editorOptions, showMinimap, height, width} = this.props
    const {middleware, scrollToLine} = this.state

    if (!decoDoc) return null

    return (
      <div style={styles.container}>
        <EditorDropTarget
          ref={'editor'}
          style={styles.editor}
          decoDoc={decoDoc}
          scrollToLine={scrollToLine}
          options={editorOptions}
          middleware={middleware}
          onImportItem={this.onImportComponent}
          onFocus={this.onFocus}
        />
        {showMinimap && (
          <div style={styles.minimap}>
            <Minimap
              text={decoDoc && decoDoc.code}
              width={getMinimapWidth(width)}
              height={height}
              onScrollToLine={this.onScrollToLine}
            />
          </div>
        )}
      </div>
    )
  }
}

const ConnectedClass = connect(mapStateToProps, mapDispatchToProps)(Editor)

export default ConnectedClass

export const registerLoader = () => {
  const loaderId = 'com.decosoftware.text'

  ContentLoader.registerLoader({
    name: 'Text',
    id: loaderId,
    filter: (uri) => (
      uri.startsWith('file://') ||
      URIUtils.getParam(uri, 'loader') === loaderId
    ),
    renderContent: ({uri, tabContainerId, tabGroupIndex, focused, width, height}) => (
      <ConnectedClass
        uri={uri}
        tabContainerId={tabContainerId}
        tabGroupIndex={tabGroupIndex}
        focused={focused}
        fileId={URIUtils.withoutProtocolOrParams(uri)}
        width={width}
        height={height}
      />
    ),
  })
}
