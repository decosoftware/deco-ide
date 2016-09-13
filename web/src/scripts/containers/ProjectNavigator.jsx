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
import { tabActions } from '../actions'
import * as fileActions from '../actions/fileActions'
import * as fileTreeCompositeActions from '../actions/fileTreeCompositeActions'
import * as compositeFileActions from '../actions/compositeFileActions'
import * as uiActions from '../actions/uiActions'
import { fileTreeController, PLUGINS } from '../filetree'
import { showContextMenu } from '../filetree/contextMenu'
import { CONTENT_PANES } from '../constants/LayoutConstants'
import { PaneHeader, Node, NamingBanner } from '../components'

const SCAFFOLDS = FileScaffoldFactory.getScaffolds()

const mapStateToProps = (state) => ({
  tree: state.directory.fileTree,
  version: state.directory.version,
})

const mapDispatchToProps = (dispatch) => ({
  tabActions: bindActionCreators(tabActions, dispatch),
  fileActions: bindActionCreators(fileActions, dispatch),
  fileTreeCompositeActions: bindActionCreators(fileTreeCompositeActions, dispatch),
  compositeFileActions: bindActionCreators(compositeFileActions, dispatch),
  uiActions: bindActionCreators(uiActions, dispatch),
  dispatch,
})

class ProjectNavigator extends Component {

  static defaultProps = {
    className: '',
    style: {},
  }

  componentWillMount() {
    this.showContextMenu = showContextMenu.bind(this, this.props.dispatch)
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

    this.props.tabActions.makeTabPermanent(CONTENT_PANES.CENTER, filepath)
  }

  onNameFile = (dirpath, scaffoldId, filename) => {
    let text = ''

    if (typeof scaffoldId !== 'undefined') {
      filename = FileScaffoldFactory.updateFilename(scaffoldId, filename)
      text = FileScaffoldFactory.generateScaffold(scaffoldId, {filename})
    }

    this.props.fileTreeCompositeActions.createFile(path.join(dirpath, filename), text)
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

  renderNode = (props) => {
    return (
      <Node
        {...props}
        scaffolds={SCAFFOLDS}
        createFileScaffold={this.onCreateFile}
      />
    )
  }

  render() {
    const {style, className, tree, version} = this.props

    return (
      <div
        className={'project-navigator vbox ' + className}
        style={style}
      >
        <PaneHeader text={'Project'} />
        <FileTree
          nodeHeight={24}
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
