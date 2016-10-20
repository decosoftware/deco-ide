import React, { Component } from 'react'
import { storyboardActions, storyboardStore } from 'yops'
import pureRender from 'pure-render-decorator'

@pureRender
export default class DeleteSceneButton extends Component {
  static defaultProps = {
    onClick: () => {},
  }

  render() {
    const closeStyles = {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      position: 'absolute',
      left: '-10px',
      top: '-10px',
      border: '2px solid black',
      fontWeight: 'bold',
      textAlign: 'center',
      fontSize: '14px',
      lineHeight: '14px',
      cursor: 'pointer',
    }

    return (
      <div style={closeStyles} onClick={this.props.onClick}>
        x
      </div>
    )
  }
}
