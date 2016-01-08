'use strict';

const logger = require('../helper').logger,
      path   = require('path'),
      redis  = require('../helper/redis');

// Dynamic loading Messaging...
const messengers = {};
require('fs').readdirSync(__dirname).forEach((file) => {
  if (/^[a-z_]+\.messenger\.js$/.test(file)) {
    const name = path.basename(file, '.messenger.js');
    logger.debug('Loading %s messenger...', name);
    const Messenger = require(path.join(__dirname, file));
    messengers[name] = new Messenger(redis);
  }
});

module.exports = messengers;
