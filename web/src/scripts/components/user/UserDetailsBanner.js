import React, { Component, } from 'react'

const styles = {
  container: {
    height: 53,
    borderStyle: 'solid',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: 'rgb(228,228,228)',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  photo: {
    width: 32,
    height: 32,
    backgroundSize: 'cover',
    borderRadius: 3,
    backgroundColor: 'teal',
    marginLeft: 10,
    marginRight: 8,
  },
  username: {
    color: 'rgb(83,83,83)'
  },
  description: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: '16px',
    fontSize: 11,
  },
  blueText: {
    color: '#549AE6',
  },
  purpleText: {
    color: '#9B0EFE',
  },
  greenText: {
    color: '#8ED72B',
  }
}

export default class extends Component {

  static propTypes = {}

  static defaultProps = {}

  constructor(props) {
    super(props)

    this.state = {}
  }

  render() {
    const {name, username, thumbnail, componentCount, downloadCount} = this.props
    const thumbnailStyle = {backgroundImage: `url(${thumbnail})`}

    return (
      <div style={styles.container}>
        <div style={{...styles.photo, ...thumbnailStyle}} />
        <div style={styles.description}>
          <div>
            <b style={styles.username}>@{username}</b> ({name})
          </div>
          <div>
            <span style={styles.blueText}>{componentCount} components</span>
            {' | '}
            <span style={styles.greenText}>{downloadCount} downloads</span>
          </div>
        </div>
      </div>
    )
  }
}
