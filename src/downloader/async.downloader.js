'use strict';

const messaging = require('../messaging'),
      logger    = require('../helper').logger;


/**
 * Download resources.
 * @param {Array} resources Array of Resource
 * @param {String} dest Destination directory
 * @returns {Promise} Promise of download
 */
const download = function(resources, dest) {
  const data = {
    dest: dest,
    resources: resources
  };

  logger.debug('Puting download to the queue: %j ...', data);
  return messaging.download.push(data);
};

/**
 * Async downloader.
 * @module async.downloader
 */
module.exports = download;

