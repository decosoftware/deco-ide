import React, { Component } from 'react'
import { storyboardActions, storyboardStore } from 'yops'
import pureRender from 'pure-render-decorator'
import { StylesEnhancer } from 'react-styles-provider'

const stylesCreator = ({colors, fonts}) => {
  const styles = {
    deleteSceneButton: {
      width: '20px',
      height: '20px',
      position: 'absolute',
      borderRadius: '50%',
      lineHeight: '14px',
      left: '-20px',
      top: '-10px',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: '14px',
      cursor: 'default',
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
    const { styles } = this.props
    return (
      <div style={styles.deleteSceneButton} onClick={this.props.onClick}>
        ⨉
      </div>
    )
  }
}
