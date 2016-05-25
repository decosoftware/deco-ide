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

export default class DecoLogo extends Component {
  render() {
    return (
      <div style={{
          backgroundImage: '-webkit-image-set(url(images/logo.png) 1x, url(images/logo@2x.png) 2x)',
          backgroundSize: 'cover',
          width: '165px',
          height: '34px',
        }}/>
    )
  }
}
