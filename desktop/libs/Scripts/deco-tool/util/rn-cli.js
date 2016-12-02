#!/usr/bin/env node

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 */

var path = require('path')
var fs = require('fs')
var cli;

var cliPath = path.resolve(
  process.cwd(),
  'node_modules',
  'react-native',
  'cli.js'
)

if (fs.existsSync(cliPath)) {
  cli = require(cliPath);
}

cli.run()
