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

import Node from './Node'

class UITree extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const {scrollTop, viewport, style, tree, renderNode, onCollapse} = this.props

    return (
      <div
        ref={'root'}
        className="uitree-tree"
        style={style}>
        <Node
          node={tree}
          scrollTop={scrollTop}
          viewport={viewport}
          renderNode={renderNode}
          onCollapse={onCollapse}
        />
      </div>
    )
  }
}

UITree.propTypes = {
  tree: PropTypes.object.isRequired,
  renderNode: PropTypes.func.isRequired,
  onCollapse: PropTypes.func,
}

export default UITree
