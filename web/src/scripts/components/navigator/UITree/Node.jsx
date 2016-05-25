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

const NODE_HEIGHT = 24

let childrenStyle = {
  paddingLeft: 13,
}

class Node extends Component {
  constructor(props) {
    super(props)
    this.state = {
      collapsed: true,
      isUnsaved: false,
      isSelected: false,
      nodeTop: null,
    }
  }

  componentDidMount() {
    this.calculatePosition()
  }

  componentDidUpdate() {
    this.calculatePosition()
  }

  calculatePosition() {
    if (! this.shouldOptimize()) {
      return
    }

    const node = ReactDOM.findDOMNode(this.refs.root)
    const {top} = node.getBoundingClientRect()

    if (top !== this.state.nodeTop) {
      this.setState({nodeTop: top})
    }
  }

  renderCollapse() {
    if (this.props.node.fileType == 'dir') {
      let className = ' caret-right'
      if (!this.props.node.collapsed) {
        className = ' caret-down'
      }

      return (
        <span
          className={'collapse ' + className}
          onMouseDown={function(e) {e.stopPropagation()}}>
        </span>
      )
    }

    return null
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      collapsed: nextProps.node.collapsed,
      isUnsaved: nextProps.node.isUnsaved,
      isSelected: nextProps.node.isSelected,
    })
  }

  //need to do some fancier stuff to prevent constant re-rendering
  shouldComponentUpdate(nextProps, nextState) {
    const isDirectory = nextProps.node.fileType == 'dir'
    if (isDirectory) {
      //if children changed we know we must update too
      if (this.props.node.children) {
        if (this.props.node.children.length != nextProps.node.children.length) {
          return true
        }
      }
      const hasChildren = nextProps.node.children && nextProps.node.children.length > 0
      if (!hasChildren) {
        return nextState.collapsed != this.state.collapsed
      }
      return true //if it has children, we don't know if its subcomponents need updating
    }

    const selectionChange = nextState.isSelected != this.state.isSelected
    const saveChange = nextState.isUnsaved != this.state.isUnsaved

    if (selectionChange || saveChange) {
      return true
    }

    return false
  }

  shouldOptimize() {
    return this.props.node.children && this.props.node.children.length > 100
  }

  renderChildren() {
    if (! this.props.node.children ||
        this.props.node.children.length == 0 ||
        this.props.node.collapsed) {
      return null
    }

    const shouldOptimize = this.shouldOptimize()
    const {nodeTop} = this.state
    const {viewport, scrollTop} = this.props

    let topSpacer = null
    let bottomSpacer = null
    let children = this.props.node.children

    if (shouldOptimize && _.isNumber(nodeTop)) {
      const nodeCount = Math.ceil(viewport.height / NODE_HEIGHT)
      const viewportStartIndex = Math.floor(Math.max(scrollTop - viewport.top, 0) / NODE_HEIGHT)

      // Create a window of +/- nodeCount
      const startIndex = Math.max(viewportStartIndex - nodeCount, 0)
      const endIndex = Math.min(viewportStartIndex + nodeCount * 2, this.props.node.children.length)

      const topSpacerHeight = startIndex * NODE_HEIGHT
      const bottomSpacerHeight = Math.max(this.props.node.children.length - endIndex - 1, 0) * NODE_HEIGHT

      topSpacer = <div style={{height: topSpacerHeight}}/>
      bottomSpacer = <div style={{height: bottomSpacerHeight}}/>

      children = this.props.node.children.slice(startIndex, endIndex)
    }

    return (
      <div className='children' style={childrenStyle}>
        {shouldOptimize && topSpacer}
        {_.map(children, (childNode) => (
          <Node
            key={childNode.id}
            viewport={this.props.viewport}
            scrollTop={this.props.scrollTop}
            node={childNode}
            onCollapse={this.props.onCollapse}
            renderNode={this.props.renderNode}
          />
        ))}
        {shouldOptimize && bottomSpacer}
      </div>
    )
  }

  handleCollapse(e) {
    e.stopPropagation()
    if (this.props.onCollapse) {
      this.props.onCollapse(this.props.node, this.props.node.collapsed)
    }
  }

  render() {
    return (
      <div ref={'root'} className={'uitree-node'}>
        <div className="inner" ref="inner" onClick={this.handleCollapse.bind(this)}>
          {this.props.renderNode(this.props.node, this.renderCollapse())}
        </div>
        {this.renderChildren()}
      </div>
    )
  }

}

Node.propTypes = {
  node: PropTypes.object.isRequired,
  renderNode: PropTypes.func.isRequired,
  onCollapse: PropTypes.func,
}

export default Node
