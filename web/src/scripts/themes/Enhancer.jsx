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

import React, { Component, } from 'react'
import memoize from 'fast-memoize'

export default (stylesCreator, mapPropsToStyles) => {

  const createStyles = memoize(stylesCreator)

  return (WrappedComponent) => class extends Component {

    static contextTypes = {
      theme: React.PropTypes.object,
    }

    constructor(props, context) {
      super()
      this.state = this.mapContextToState(props, context)
    }

    componentWillReceiveProps(nextProps, nextContext) {
      if (nextContext.theme !== this.context.theme) {
        this.setState(this.mapContextToState(nextProps, nextContext))
      }

      // Update all styles on HMR regardless of theme change
      if (module.hot) {
        this.setState(this.mapContextToState(nextProps, nextContext))
      }
    }

    mapContextToState(props, context) {
      const {theme} = context

      if (mapPropsToStyles) {
        return {styles: createStyles(theme, mapPropsToStyles(props))}
      } else {
        return {styles: createStyles(theme)}
      }
    }

    render() {
      const {styles} = this.state

      return (
        <WrappedComponent styles={styles} {...this.props} />
      )
    }
  }
}
