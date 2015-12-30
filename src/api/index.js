'use strict';

const logger  = require('../helper').logger,
      path    = require('path'),
      express = require('express');

const router = express.Router();

// Dynamic loading API...
require('fs').readdirSync(__dirname).forEach((file) => {
  if (/^[a-z]+\.api\.js$/.test(file)) {
    const name = path.basename(file, '.api.js');
    logger.debug('Loading %s API...', name);
    require(path.join(__dirname, file))(router);
  }
});

/**
 * API.
 */
module.exports = router;
