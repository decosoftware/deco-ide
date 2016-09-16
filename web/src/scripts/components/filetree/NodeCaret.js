import React, { Component } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { StylesEnhancer } from 'react-styles-provider'

import styles from './styles'

const stylesCreator = ({colors}) => {
  return {
    caret: {
      flex: '0 0 auto',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 5,
      position: 'relative',
      top: -2,
      color: colors.text,
    }
  }
}

@StylesEnhancer(stylesCreator)
export default class extends Component {

  static defaultProps = {
    expanded: false,
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  onMouseDown = (e) => e.stopPropagation()

  render() {
    const {styles, expanded} = this.props
    const className = expanded ? 'caret-down' : 'caret-right'

    return (
      <span
        className={className}
        style={styles.caret}
        onMouseDown={this.onMouseDown}>
      </span>
    )
  }
}
