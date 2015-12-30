'use strict';

const logger = require('../../../helper').logger,
      path  = require('path');

module.exports = function(app, loginMiddleware) {
  // Dynamic loading providers...
  require('fs').readdirSync(__dirname).forEach((file) => {
    if (/^[a-z]+\.provider\.js$/.test(file)) {
      const name = path.basename(file, '.provider.js');
      logger.debug('Loading %s auth provider...', name);
      require(path.join(__dirname, file))(app, loginMiddleware);
    }
  });
};

