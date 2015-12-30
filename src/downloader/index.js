'use strict';

const logger = require('../helper').logger,
      path   = require('path');

// Dynamic loading downloader...
const DOWNLOADER = process.env.APP_DOWNLOADER;
let downloader = null;
require('fs').readdirSync(__dirname).forEach((file) => {
  if (file === `${DOWNLOADER}.downloader.js`) {
    logger.debug('Loading %s downloader...', DOWNLOADER);
    downloader = require(path.join(__dirname, file));
  }
});

if (!downloader) {
  logger.debug('Downloader not found. Using none...');
  downloader = function(/*resources, container*/) {
    logger.debug('Resource downloader disabled.');
    return Promise.resolve();
  };
}

module.exports = downloader;
