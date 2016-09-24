import React, { Component, } from 'react'
import { StylesEnhancer } from 'react-styles-provider'
import pureRender from 'pure-render-decorator'

const stylesCreator = ({colors}, {thumbnail}) => ({
  container: {
    height: 53,
    borderStyle: 'solid',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: colors.dividerInverted,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  topRow: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  photo: {
    width: 32,
    height: 32,
    backgroundSize: 'cover',
    borderRadius: 3,
    backgroundColor: 'teal',
    marginRight: 8,
    backgroundImage: `url(${thumbnail})`,
  },
  username: {
    color: colors.text,
  },
  signOut: {
    color: '#198BFB',
  },
  description: {
    flex: 1,
    lineHeight: '16px',
    fontSize: 11,
    display: 'flex',
    flexDirection: 'column',
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
})

@StylesEnhancer(stylesCreator, ({thumbnail}) => ({thumbnail}))
@pureRender
export default class extends Component {

  static propTypes = {}

  static defaultProps = {}

  render() {
    const {styles, username, componentCount, downloadCount, onSignOut} = this.props

    return (
      <div style={styles.container}>
        <div style={styles.photo} />
        <div style={styles.description}>
          <div style={styles.topRow}>
            <b style={styles.username}>@{username}</b>
            <b style={styles.signOut} onClick={onSignOut}>Sign Out</b>
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
