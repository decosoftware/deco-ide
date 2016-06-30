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

const styles = {
  github: {
    width: 20,
    height: 20,
    backgroundSize: '20px 20px',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundImage: `-webkit-image-set(url('./images/github-logo.png') 1x, url('./images/github-logo@2x.png') 2x)`,
  }
}

export default () => <div style={styles.github} />
