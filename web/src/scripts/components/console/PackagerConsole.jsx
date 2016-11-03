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

const style = {
  innerContainer: {
    color: 'rgba(255,255,255,0.8)',
    width: '100%',
    flex: '1 1 auto',
    overflow: 'auto',
    paddingLeft: 9,
    paddingBottom: 9,
    margin: 0,
    WebkitUserSelect: 'text',
    fontSize: 12,
    lineHeight: '16px',
    fontFamily: '"Roboto Mono", monospace',
  }
}

//TODO: set scroll position in UI state
class PackagerConsole extends Component {
  componentDidMount() {
    var node = ReactDOM.findDOMNode(this)
    node.scrollTop = this.props.initialScrollHeight
  }

  componentWillUpdate() {
    var node = ReactDOM.findDOMNode(this)
    this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight
  }

  componentDidUpdate() {
    if (this.shouldScrollBottom) {
      var node = ReactDOM.findDOMNode(this)
      node.scrollTop = node.scrollHeight
    }
  }

  componentWillUnmount() {
    var node = ReactDOM.findDOMNode(this)
    this.props.saveScrollHeight(node.scrollTop)
  }

  render() {
    return (
      <pre className={'scrollbar-theme-dark'}
        style={style.innerContainer}>
        {this.props.packagerOutput}
      </pre>
    )
  }
}

PackagerConsole.propTypes = {
  packagerOutput: PropTypes.string,
  initialScrollHeight: PropTypes.number.isRequired,
  saveScrollHeight: PropTypes.func.isRequired,
}

export default PackagerConsole
