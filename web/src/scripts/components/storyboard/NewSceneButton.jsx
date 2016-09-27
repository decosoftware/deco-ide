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

import React, { Component, PropTypes, } from 'react'
import pureRender from 'pure-render-decorator'

@pureRender
export default class NewSceneButton extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
  }

  render() {
    const style = {
      position: 'absolute',
      background: 'black',
      width: '30px',
      height: '30px',
      borderRadius: '25%',
      top: '20px',
      right: '20px',
      zIndex: 1,
      textAlign: 'center',
      paddingTop: '3px',
      color: 'white',
      fontWeight: 'bold',
      cursor: 'pointer',
    }

    return (
      <div style={style} onClick={this.props.onClick}>
        +
      </div>
    )
  }
}
