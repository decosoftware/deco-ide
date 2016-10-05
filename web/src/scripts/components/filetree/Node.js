import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import memoize from 'fast-memoize'

import NodeCaret from './NodeCaret'
import PlusButtonWithDropdown from './PlusButtonWithDropdown'
import PlayButton from './PlayButton'
import styles, { getPaddedStyle } from './styles'
import { StylesEnhancer } from 'react-styles-provider'

const isDirectory = (type) => {
  return type === 'directory'
}

const stylesCreator = ({colors, fonts}) => {
  const styles = {
    fileIcon: {
      width: 14,
      height: 14,
      WebkitMaskPosition: 'left',
      WebkitMaskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat',
      WebkitMaskImage: `-webkit-image-set(` +
        `url('./icons/icon-file.png') 1x, ` +
        `url('./icons/icon-file@2x.png') 2x` +
      `)`,
      backgroundColor: colors.fileTree.icon,
      marginLeft: 16,
      marginRight: 8,
      position: 'relative',
      alignSelf: 'center',
      top: -1,
      flex: '0 0 auto',
    },
    folderIcon: {
      width: 14,
      height: 14,
      WebkitMaskPosition: 'left',
      WebkitMaskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat',
      WebkitMaskImage: `-webkit-image-set(` +
        `url('./icons/icon-folder.png') 1x, ` +
        `url('./icons/icon-folder@2x.png') 2x` +
      `)`,
      backgroundColor: colors.fileTree.icon,
      marginRight: 8,
      marginLeft: 7,
      alignSelf: 'center',
      position: 'relative',
      top: -1,
      flex: '0 0 auto',
    },
    plusContainer: {
      display: 'flex',
      alignSelf: 'center',
    },
    nodeText: {
      ...fonts.regular,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    nodeContent: {
      flex: '1 1 auto',
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      minHeight: 0,
      minWidth: 0,
      cursor: 'default',
    },
  }

  styles.getNodeStyle = memoize((depth, selected, hover) => {
    return {
      ...styles.nodeContent,
      paddingLeft: 15 + depth * 18,
      backgroundColor: selected ? colors.fileTree.backgroundSelected :
          hover ? colors.fileTree.backgroundHover : colors.fileTree.background,
      color: selected ? colors.fileTree.textSelected : colors.fileTree.text,
    }
  })

  return styles
}

@StylesEnhancer(stylesCreator)
export default class Node extends Component {

  state = {
    menuVisible: false,
  }

  stopPropagation = (e) => {
    e.stopPropagation()
  }

  handleVisibilityChange = (menuVisible) => {
    this.setState({menuVisible})
  }

  renderButton() {
    const {node, scaffolds, createFileScaffold, onPreviewClick, isPreviewActive} = this.props
    const {hover, menuVisible} = this.state
    const {type} = node

    if (!(menuVisible || hover || isPreviewActive)) {
      return null
    }

    if (!isDirectory(type)) {
      return (
        <div style={styles.plusContainer} onClick={this.stopPropagation}>
          <PlayButton
            isActive={isPreviewActive}
            onClick={onPreviewClick}/>
        </div>
      )
    }

    return (
      <div style={styles.plusContainer}>
        <PlusButtonWithDropdown
          node={node}
          menuType={'platform'}
          scaffolds={scaffolds}
          visible={menuVisible}
          createFileScaffold={createFileScaffold}
          onVisibilityChange={this.handleVisibilityChange}
        />
      </div>
    )
  }

  onMouseEnter = () => this.setState({hover: true})

  onMouseLeave = () => this.setState({hover: false})

  render() {
    const {styles, node, metadata, depth} = this.props
    const {type, name, path} = node
    const {expanded, selected} = metadata

    const {hover} = this.state

    return (
      <div
        style={styles.getNodeStyle(depth, selected, hover)}
        onMouseEnter={this.onMouseEnter}
        onMouseLeave={this.onMouseLeave}
      >
        {isDirectory(type) && (
          <NodeCaret expanded={expanded}/>
        )}
        <div style={isDirectory(type) ? styles.folderIcon : styles.fileIcon} />
        <div className={'flex-variable'} style={styles.nodeText}>
          {name}
        </div>
        {this.renderButton()}
      </div>
    )
  }
}
