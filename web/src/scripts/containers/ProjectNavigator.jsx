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

import _ from 'lodash'
import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { createSelector } from 'reselect'
import FileTree from 'react-file-tree'
import path from 'path'

import FileScaffoldFactory from '../factories/scaffold/FileScaffoldFactory'
import { tabActions, textEditorCompositeActions, compositeFileActions } from '../actions'
import * as fileActions from '../actions/fileActions'
import * as fileTreeCompositeActions from '../actions/fileTreeCompositeActions'
import * as uiActions from '../actions/uiActions'
import { fileTreeController, PLUGINS } from '../filetree'
import { showContextMenu } from '../filetree/contextMenu'
import { CONTENT_PANES } from '../constants/LayoutConstants'
import { PaneHeader, Node, NamingBanner } from '../components'
import * as URIUtils from '../utils/URIUtils'

const SCAFFOLDS = FileScaffoldFactory.getScaffolds()

const mapStateToProps = (state) => ({
  rootPath: state.directory.rootPath,
  tree: state.directory.fileTree,
  version: state.directory.version,
})

const mapDispatchToProps = (dispatch) => ({
  tabActions: bindActionCreators(tabActions, dispatch),
  fileActions: bindActionCreators(fileActions, dispatch),
  fileTreeCompositeActions: bindActionCreators(fileTreeCompositeActions, dispatch),
  textEditorCompositeActions: bindActionCreators(textEditorCompositeActions, dispatch),
  compositeFileActions: bindActionCreators(compositeFileActions, dispatch),
  uiActions: bindActionCreators(uiActions, dispatch),
  dispatch,
})

class ProjectNavigator extends Component {

  static defaultProps = {
    className: '',
    style: {},
  }

  state = {
    currentPreview: ''
  }

  componentWillMount() {
    this.showContextMenu = showContextMenu.bind(this, this.props.dispatch, this.props.rootPath)
  }

  onSelectFile = (e, node, nodeMetadata, index) => {
    const {path: filepath, type} = node

    if (type == 'file') {
      this.props.fileActions.registerPath(filepath)
      this.props.compositeFileActions.openFile(filepath)
    }
  }

  onDoubleSelectFile = (e, node) => {
    const {path: filepath, type} = node

    this.props.tabActions.makeTabPermanent(CONTENT_PANES.CENTER, URIUtils.filePathToURI(filepath))
  }

  onNameFile = async (dirpath, scaffoldId, filename) => {
    let text = ''

    if (typeof scaffoldId !== 'undefined') {
      filename = FileScaffoldFactory.updateFilename(scaffoldId, filename)
      text = FileScaffoldFactory.generateScaffold(scaffoldId, {filename})
    }

    const filepath = path.join(dirpath, filename)

    await this.props.fileTreeCompositeActions.createFile(filepath, text)
    this.props.compositeFileActions.openFile(filepath)
  }

  onCreateFile = (node, scaffoldId) => {
    const {path: dirpath, name} = node

    const banner = (
      <NamingBanner
        bannerText={`Create new file in ${name}`}
        onTextDone={this.onNameFile.bind(this, dirpath, scaffoldId)}
      />
    )

    this.props.uiActions.pushModal(banner, true)
  }

  handlePreviewClick = async (node) => {
    const {rootPath, textEditorCompositeActions} = this.props
    this.setState({currentPreview: node.path})
    const relativePath = node.path.replace(rootPath, '.')
    const requireText = relativePath.replace(path.extname(relativePath), '')
    textEditorCompositeActions.updateDecoEntryRequire(requireText)
  }

  handleDrop = (sourceNode, targetNode) => {
    const action = sourceNode.type === 'file' ? 'renameFile' : 'renameDir'

    this.props.fileTreeCompositeActions[action](sourceNode.path, path.join(targetNode.path, sourceNode.name))
  }

  renderNode = (props) => {
    const {node} = props
    const {currentPreview} = this.state
    return (
      <Node
        {...props}
        onPreviewClick={this.handlePreviewClick.bind(this, node)}
        isPreviewActive={currentPreview === node.path}
        scaffolds={SCAFFOLDS}
        createFileScaffold={this.onCreateFile}
        onDrop={this.handleDrop.bind(this)}
      />
    )
  }

  getNodeHeight = ({index}) => index === 0 ? 36 : 24

  render() {
    const {style, className, tree, version} = this.props

    return (
      <div
        className={'project-navigator vbox ' + className}
        style={style}
      >
        <FileTree
          nodeHeight={this.getNodeHeight}
          onSelect={this.onSelectFile}
          onDoubleSelect={this.onDoubleSelectFile}
          onContext={this.showContextMenu}
          renderNode={this.renderNode}
          controller={fileTreeController}
          plugins={PLUGINS}
          // trigger re-render
          tree={tree}
          version={version}
        />
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectNavigator)
