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

import React, { Component, PropTypes, } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'

const remote = Electron.remote
const path = remote.require('path')

import PaneHeader from '../components/headers/PaneHeader'
import FileTree from 'react-file-tree'
import FileScaffoldFactory from '../factories/scaffold/FileScaffoldFactory'

import {
  addTab,
  swapTab,
  closeTab,
  makeTabPermanent,
} from '../actions/tabActions'
import {
  updateFileTreeVersion,
  registerPath,
  showInFinder,
} from '../actions/fileActions'

import { fileTreeController, Plugins } from '../filetree'
import { showContextMenu } from '../filetree/contextMenu'
import Node from '../components/filetree/Node'
import {
  createFile,
} from '../actions/fileTreeCompositeActions'

import { openFile } from '../actions/compositeFileActions'
import { openDocument, docIdChange } from '../actions/editorActions'
import { pushModal } from '../actions/uiActions'
import { historyIdChange } from '../actions/historyActions'
import { CONTENT_PANES } from '../constants/LayoutConstants'
import NamingBanner from '../components/modal/NamingBanner'

class ProjectNavigator extends Component {
  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this._showContextMenu = showContextMenu.bind(this, this.props.dispatch)
  }

  renderNode(props) {
    return (
      <Node
        {...props}
        scaffolds={FileScaffoldFactory.getScaffolds()}
        createFileScaffold={(node, scaffoldId) => {
          const { path: dirPath, name } = node
          this.props.dispatch(pushModal(
            <NamingBanner
              bannerText={`Create new file in ${name}`}
              onTextDone={(filename) => {
                let text = ''
                if (typeof scaffoldId !== 'undefined') {
                  filename = FileScaffoldFactory.updateFilename(scaffoldId, filename)
                  text = FileScaffoldFactory.generateScaffold(scaffoldId, {filename})
                }

                const newFilePath = path.join(dirPath, filename)
                this.props.dispatch(createFile(newFilePath, text))
              }} />, true))
           }} />
    )
  }

  render() {
    return (
      <div className={'project-navigator vbox ' + this.props.className}
        style={this.props.style}>
        <PaneHeader text={'Project'} />
        <FileTree
          nodeHeight={24}
          onSelect={(e, node, nodeMetadata, index) => {
            const { path: nodePath, type } = node
            if (type == 'file') {
              this.props.dispatch(registerPath(nodePath))
              this.props.dispatch(openFile(nodePath))
            }
          }}
          onDoubleSelect={(e, node, nodeMetadata, index) => {
            this.props.dispatch(makeTabPermanent(CONTENT_PANES.CENTER))
          }}
          onContext={this._showContextMenu}
          renderNode={this.renderNode.bind(this)}
          controller={fileTreeController}
          plugins={_.map(Plugins, plugin => plugin)}
        />
      </div>
    )
  }
}

ProjectNavigator.defaultProps = {
  className: '',
  style: {},
}

export default connect()(ProjectNavigator)
