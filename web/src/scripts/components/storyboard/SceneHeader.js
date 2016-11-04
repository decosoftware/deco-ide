import React, { Component, PropTypes } from 'react'
import pureRender from 'pure-render-decorator'

const styles = {
  sceneHeader: {
    height: 22,
    paddingLeft: 5,
    marginBottom: 5,
    color: '#CCCCCC',
    lineHeight: '22px',
    fontSize: 12,
    fontWeight: 300,
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'pre',
  },
}

@pureRender
export default class SceneHeader extends Component {

  static propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    scale: PropTypes.number,
    style: PropTypes.object,
    name: PropTypes.string,
  }

  static defaultProps = {
    width: 0,
    height: 0,
    scale: 1,
    name: '',
  }

  render() {
    const {style, name, width, height, scale} = this.props

    // If the scene doesn't render, don't render the header
    if (height === 0 || width === 0) {
      return null
    }

    const headerStyle = {
      ...styles.sceneHeader,
      width: width * scale,
    }

    return (
      <div
        style={{...headerStyle, ...style}}
      >
        {name}
      </div>
    )
  }
}
