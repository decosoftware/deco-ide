import React, { Component } from 'react'
import pureRender from 'pure-render-decorator'

import { StylesEnhancer } from 'react-styles-provider'

const stylesCreator = ({colors, fonts}) => {
  const styles = {
    fileIcon: {
      width: 12,
      height: 12,
      position: 'absolute',
      right: '-25px',
      top: '25px',
      alignSelf: 'center',
      WebkitMaskPosition: 'left',
      WebkitMaskSize: 'contain',
      WebkitMaskRepeat: 'no-repeat',
      WebkitMaskImage: `-webkit-image-set(` +
        `url('./icons/icon-file.png') 1x, ` +
        `url('./icons/icon-file@2x.png') 2x` +
      `)`,
      backgroundColor: colors.fileTree.icon,
    }
  }
  return styles
}

@pureRender
@StylesEnhancer(stylesCreator)
export default class QuickOpenCodeButton extends Component {
  static defaultProps = {
    onClick: () => {},
  }
  render() {
    const { styles, onClick } = this.props
    return (
      <div style={styles.fileIcon} onClick={this.props.onClick}/>
    )
  }
}
