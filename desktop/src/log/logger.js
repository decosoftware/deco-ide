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

"use strict";

const app = require('electron').app;

const path = require('path');

const winston = require('winston');
const _ = require('lodash');

const LOG_FILE = path.join(app.getPath('appData'), '/com.decosoftware.Deco/logs.out');

const raven = require('raven');
const Sentry = new raven.Client('https://a1ba00d4bfe94b0586811f5ffb5d0596:d67db2941b2f4665b2940c7ed604d32d@app.getsentry.com/64868');

class SentryLogger extends winston.Transport {
  constructor(options) {
    options = options || {};
    super(options);
    this._sentry = Sentry;
    this.name = 'Sentry';
    this.levelsMap = {
      silly: 'debug',
      verbose: 'debug',
      info: 'info',
      debug: 'debug',
      warn: 'warning',
      error: 'error'
    };
    this.logger = options.logger || 'root';
  }

  log(level, msg, meta, callback) {
    meta = meta || {};
    level = this.levelsMap[level] || "info";

    let extraData = _.extend({}, meta);
    let tags = extraData.tags || null;
    delete extraData.tags;

    let extra = {
      'level': level,
      'logger': this.logger,
      'extra': extraData,
      'tags': tags
    };

    try {
      if(level == 'error') {
        // Support exceptions logging
        if (!global.__DEV__) {
          this._sentry.captureError(msg, extra, function(err) {
            callback(null, true);
          });
        }
      } else {
        // Only send errors to Sentry for now...
        // this._sentry.captureMessage(msg, extra, function(err) {
        //   callback(null, true);
        // });
      }
    } catch(err) {
      console.log(err);
    }
  }
}

class Logger {
  constructor() {
    let level = "info";
    if (global.__DEV__) {
      level = "debug";
    }
    let options = {
      filename: LOG_FILE,
      level: level,
      tailable: true,
      handleExceptions: true,
      humanReadableUnhandledException: true,
      maxFiles: 10,
      maxSize: 10000000 //10MB logfile size
    };
    let transports = [
      new (winston.transports.File)(options),
      new (winston.transports.Console)()
    ];
    if (!global.__DEV__) {
      transports.push(new SentryLogger({
        handleExceptions: true,
        humanReadableUnhandledException: true,
      }));
    }
    this._logger = new (winston.Logger)({
      transports: transports
    });
  }

  get logger() {
    return this._logger;
  }
}

module.exports = new Logger().logger;
