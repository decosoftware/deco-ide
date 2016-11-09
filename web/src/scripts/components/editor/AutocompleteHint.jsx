/**
 *    Copyright (C) 2015 Deco Software Inc.
 *
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Affero General Public License, version 3,
 *    as published by the Free Software Foundation.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Affero General Public License for more details.
 *
 *    You should have received a copy of the GNU Affero General Public License
 *    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */

import React, { Component } from 'react'

const styles = {
  item: {
    width: 500,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  left: {
    flex: '0 0 200px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  right: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
}

styles.boldText = {
  ...styles.text,
  fontWeight: 'bold',
}

styles.lighterText = {
  ...styles.text,
  color: 'rgba(255,255,255,0.5)',
}

export default class extends Component {
  getFunctionSnippet = (functionDetails) => {
    const {params, return_type} = functionDetails
    const paramsSnippet = params.map(param => param.name).join(', ')
    return `(${paramsSnippet}) => ${return_type}`
  }

  renderSnippet = (functionDetails, type) => {
    if (functionDetails) {
      return (
        <div style={styles.lighterText}>
          {this.getFunctionSnippet(functionDetails)}
        </div>
      )
    } else if (type) {
      return (
        <div style={styles.lighterText}>
          {type}
        </div>
      )
    } else {
      return null
    }
  }

  renderHighlightedWord = (text, wordToComplete) => {
    let result = []
    let wtcIndex = 0
    for (let i=0; i<text.length; i++) {
      if (wordToComplete[wtcIndex] === text[i].toLowerCase()) {
        result.push(<div key={i} style={styles.boldText}> {text[i]} </div>)
        wtcIndex++
      } else {
        result.push(<div key={i} style={styles.lighterText}> {text[i]} </div>)
      }
    }
    return result
  }

  render() {
    const {text, wordToComplete, type, functionDetails} = this.props

    return (
      <div style={styles.item}>
        <div style={styles.left}>
          {this.renderHighlightedWord(text, wordToComplete.toLowerCase())}
        </div>
        <div style={styles.right}>
          {this.renderSnippet(functionDetails, type)}
        </div>
      </div>
    )
  }
}
