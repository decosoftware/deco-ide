import React, { Component } from 'react'
import { storyboardActions, storyboardStore } from 'yops'
import pureRender from 'pure-render-decorator'
import { StylesEnhancer } from 'react-styles-provider'

import styles from './styles'

const stylesCreator = ({colors, fonts}) => {
  const styles = {
    deleteButtonColor: {
      color: colors.fileTree.icon,
      border: `2px solid ${colors.fileTree.icon}`
    }
  }
  return styles
}

@pureRender
@StylesEnhancer(stylesCreator)
export default class DeleteSceneButton extends Component {
  static defaultProps = {
    onClick: () => {},
  }

  render() {
    const buttonStyle = {
      ...styles.deleteSceneButton,
      ...this.props.styles.deleteButtonColor,
    }
    return (
      <div style={buttonStyle} onClick={this.props.onClick}>
        ⨉
      </div>
    )
  }
}
