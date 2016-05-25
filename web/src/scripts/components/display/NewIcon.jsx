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

import React from 'react'

const style = {
  width: 21,
  height: 21,
  WebkitMaskSize: '21px 21px',
  WebkitMaskPosition: 'center',
  WebkitMaskRepeat: 'no-repeat',
  WebkitMaskImage:
    `-webkit-image-set(url('./icons/icon-new-project.png') 1x, ` +
    `url('./icons/icon-new-project@2x.png') 2x)`,
  backgroundColor: '#787676',
  marginRight: 4,
  position: 'relative',
  top: 1,
}

const NewIcon = () => {
  return (
    <div style={style} />
  )
}

export default NewIcon
