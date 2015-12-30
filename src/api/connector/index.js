'use strict';

const logger = require('../../helper').logger,
      path   = require('path');

module.exports = function(router) {
  // Dynamic loading connectors...
  require('fs').readdirSync(__dirname).forEach((file) => {
    if (/^[a-z]+\.connector\.js$/.test(file)) {
      const name = path.basename(file, '.connector.js');
      logger.debug('Loading %s connector API...', name);
      require(path.join(__dirname, file))(router);
    }
  });
};

