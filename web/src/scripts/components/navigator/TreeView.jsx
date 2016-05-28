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
import ReactDOM from 'react-dom'

import _ from 'lodash'

import NavigatorHeader from './NavigatorHeader'
import FileNode from './FileNode'
import UITree from './UITree'
import MenuItem from '../menu/MenuItem'

const style = {
  flex: '0 0 30px',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  paddingLeft: 13,
  color: 'rgb(63,63,63)',
  fontSize: 11,
  letterSpacing: 0.3,
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
}
const hoverStyle = {
  backgroundColor: 'white',
}

const selectedStyle = {
  backgroundColor: 'rgba(200,200,200,0.4)',
}

const unsavedStyle = {
  fontStyle: 'italic',
}

function renderFileNode(props, node) {
  return (
    <FileNode
      style={style}
      node={node}
      hoverStyle={Object.assign({}, style, hoverStyle)}
      selectedStyle={Object.assign({}, style, selectedStyle)}
      unsavedStyle={Object.assign({}, style, unsavedStyle)}
      isSelected={node.isSelected}
      isUnsaved={node.isUnsaved}
      moduleName={node.module}
      onRename={props.onRename}
      onDelete={props.onDelete}
      onShowInFinder={props.onShowInFinder}
      onClick={() => {
        props.onClickNode(node)
      }}
      onDoubleClick={() => {
        props.onDoubleClickNode(node)
      }}>
      {node.module}
    </FileNode>
  )
}

function renderDirNode(props, node, collapseButton) {
  return (
    <NavigatorHeader listName={node.module}
      node={node}
      scaffolds={props.scaffolds}
      onRename={props.onRenameDir}
      onDelete={props.onDelete}
      onShowInFinder={props.onShowInFinder}
      onCreateSubFile={props.onCreateSubFile}
      onCreateSubDir={props.onCreateSubDir}>
      {collapseButton}
    </NavigatorHeader>
  )
}

function renderNode(props, node, collapseButton) {
  if (node.leaf) {
    return renderFileNode(props, node)
  } else {
    return renderDirNode(props, node, collapseButton)
  }
}

const treeStyle = {
  display: 'flex',
  flexDirection: 'column',
  flex: '1 0 auto',
  paddingTop: 5,
  paddingBottom: 5,
  paddingLeft: 10,
}

class TreeView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      scrollTop: 0,
    }

    this.handleScroll = _.throttle(this.handleScroll.bind(this), 100)
  }

  componentDidMount() {
    this.calculatePosition()
  }

  componentDidUpdate() {
    this.calculatePosition()
  }

  calculatePosition() {
    const node = ReactDOM.findDOMNode(this.refs.root)
    const scrollTop = node.scrollTop

    if (scrollTop !== this.state.scrollTop) {
      this.setState({scrollTop})
    }

    const {top, bottom} = node.getBoundingClientRect()
    const viewport = {top, bottom, height: bottom - top}

    if (! _.isEqual(viewport, this.state.viewport)) {
      this.setState({viewport})
    }
  }

  handleScroll() {
    this.calculatePosition()
  }

  render() {
    const {
      tree, scaffolds,
      onCollapse, onClickNode, onDoubleClickNode,
      onCreateSubDir, onCreateSubFile, onRename, onRenameDir, onDelete, onShowInFinder,
    } = this.props

    const {viewport, scrollTop} = this.state

    return (
      <div ref={'root'}
        style={{flex: '1 1 auto', overflow: 'auto'}}
        onScroll={this.handleScroll}>
        <UITree
          style={treeStyle}
          tree={tree}
          scrollTop={scrollTop}
          viewport={viewport}
          renderNode={renderNode.bind(this, {
            onClickNode,
            onDoubleClickNode,
            onCreateSubDir,
            onCreateSubFile,
            onRename,
            onRenameDir,
            onDelete,
            onShowInFinder,
            scaffolds,
          })}
          onCollapse={onCollapse}/>
      </div>
    )
  }
}

TreeView.propTypes = {
  tree: PropTypes.object.isRequired,
  onClickNode: PropTypes.func.isRequired,
  onCollapse: PropTypes.func.isRequired,
}

export default TreeView
