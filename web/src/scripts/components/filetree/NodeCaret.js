import React, { Component } from 'react'
import shallowCompare from 'react-addons-shallow-compare'

import styles from './styles'

const caretStyle = {
  flex: '0 0 auto',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 6,
}

export default class extends Component {

  static defaultProps = {
    expanded: false,
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shallowCompare(this, nextProps, nextState)
  }

  render() {
    const {expanded} = this.props
    const className = expanded ? 'caret-down' : 'caret-right'

    return (
      <span
        style={caretStyle}
        className={'collapse ' + className}
        onMouseDown={function(e) {e.stopPropagation()}}>
      </span>
    )
  }
}
