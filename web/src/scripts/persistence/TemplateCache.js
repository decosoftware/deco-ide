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

import KeyValueStore from './KeyValueStore'

const NAME = 'deco-template-cache'

class TemplateCache {

  constructor() {
    this.store = new KeyValueStore(NAME)
  }

  _buildModuleId(textUrl, metadataUrl) {
    return `${textUrl}::${metadataUrl}`
  }

  put(textUrl, metadataUrl, text, metadata) {
    const id = this._buildModuleId(textUrl, metadataUrl)
    return this.store.put(id, {text, metadata})
  }

  get(textUrl, metadataUrl) {
    const id = this._buildModuleId(textUrl, metadataUrl)
    return this.store.get(id)
  }

}

export default new TemplateCache()
