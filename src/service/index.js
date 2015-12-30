'use strict';

const logger = require('../helper').logger,
      path   = require('path');

// Dynamic loading services...
const services = {};
require('fs').readdirSync(__dirname).forEach((file) => {
  if (/^[a-z_]+\.service\.js$/.test(file)) {
    const name = path.basename(file, '.service.js');
    logger.debug('Loading %s service...', name);
    services[name] = require(path.join(__dirname, file));
  }
});

module.exports = services;
