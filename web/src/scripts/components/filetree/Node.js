import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import nodePath from 'path'

import NodeCaret from './NodeCaret'
import PlusButtonWithDropdown from './PlusButtonWithDropdown'
import styles, { getPaddedStyle } from './styles'

const isDirectory = (type) => {
  return type === 'directory'
}

const fileIconStyle = {
  width: 11,
  height: 11,
  WebkitMaskPosition: 'center',
  WebkitMaskRepeat: 'no-repeat',
  WebkitMaskImage: `-webkit-image-set(` +
    `url('./icons/icon-file.png') 1x, ` +
    `url('./icons/icon-file@2x.png') 2x` +
  `)`,
  backgroundColor: "#484848",
  marginLeft: 15,
  marginRight: 6,
  position: 'relative',
  alignSelf: 'center',
  top: -1,
  flex: '0 0 auto',
}

const folderIconStyle = {
  width: 11,
  height: 11,
  WebkitMaskPosition: 'center',
  WebkitMaskRepeat: 'no-repeat',
  WebkitMaskImage: `-webkit-image-set(` +
    `url('./icons/icon-folder.png') 1x, ` +
    `url('./icons/icon-folder@2x.png') 2x` +
  `)`,
  backgroundColor: "#484848",
  marginRight: 6,
  marginLeft: 6,
  alignSelf: 'center',
  position: 'relative',
  top: -2,
  flex: '0 0 auto',
}

export default class Node extends Component {

  constructor() {
    super()

    this.state = {
      menuVisible: false,
    }
  }

  renderButton() {
    const { hover, menuVisible } = this.state
    const { node, scaffolds, createFileScaffold } = this.props
    const { type } = node

    if (! (menuVisible || hover) || type == 'file') {
     return null
    }

    return (
      <div style={{
          display: 'flex',
          alignSelf: 'center',
          marginBottom: 4,
        }}>
        <PlusButtonWithDropdown
          node={node}
          scaffolds={scaffolds}
          visible={menuVisible}
          createFileScaffold={createFileScaffold}
          onVisibilityChange={(menuVisible) => {
            this.setState({menuVisible})
          }}
        />
      </div>
    )
   }

  render() {
    const {node, metadata, depth} = this.props
    const {type, name, path} = node
    const {expanded, selected} = metadata

    const {hover} = this.state

    return (
      <div style={getPaddedStyle(depth, selected, hover)}
        onMouseEnter={() => this.setState({hover: true})}
        onMouseLeave={() => this.setState({hover: false})}
      >
        {isDirectory(type) && (
          <NodeCaret
            expanded={expanded}
          />
        )}
        {isDirectory(type) ? (
          <div style={folderIconStyle} />
        ) : (
          <div style={fileIconStyle} />
        )}
        <div className={'flex-variable'} style={styles.nodeText}>{name}</div>
        {this.renderButton()}
      </div>
    )
  }
}
