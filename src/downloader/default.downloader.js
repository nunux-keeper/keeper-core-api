'use strict';

const when       = require('when'),
      nodefn     = require('when/node/function'),
      sequence   = require('when/sequence'),
      dns        = require('dns'),
      url        = require('url'),
      storage    = require('../storage'),
      request    = require('../helper').request,
      validators = require('../helper').validators,
      logger     = require('../helper').logger;

/**
 * Download resources.
 * @param {Array} resources Array of Resource
 * @param {String} container Destination container
 * @returns {Promise} Promise of download
 */
const download = function(resources, container) {
  const down = function(resource) {
    if (!validators.isURL(resource.url)) {
      logger.error('Unable to download %s. Bad URL.', resource.url);
      return when.resolve('Bad URL: ' + resource.url);
    }
    logger.debug('Downloading %s to container %s...', resource.url, container);

    const tryDownload = function() {
      return storage.store(container, resource.key, request(resource.url), {'Content-Type': resource.type});
    };

    const hostname = url.parse(resource.url).hostname;
    return nodefn.call(dns.resolve4, hostname)
    .then(tryDownload, function(/*e*/) {
      logger.error('Unable to download %s. Host cannot be resolved: %s', resource.url, hostname);
      return when.reject('Host cannot be resolved: %s', hostname);
    });
  };

  logger.debug('Downloading resources to %s...', container);
  const tasks = [];
  resources.forEach(function(resource) {
    tasks.push(function() { return down(resource); });
  });
  return sequence(tasks);
};

/**
 * Default downloader.
 * @module default.downloader
 */
module.exports = download;

