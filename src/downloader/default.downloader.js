'use strict'

const logger = require('../helper').logger
const nodefn = require('when/node/function')
const sequence = require('when/sequence')
const dns = require('dns')
const url = require('url')
const validator = require('validator')
const storage = require('../storage')
const request = require('../helper').request

/**
 * Download resources.
 * @param {Array} resources Array of Resource
 * @param {String} container Destination container
 * @returns {Promise} Promise of download
 */
const download = function (resources, container) {
  const down = function (resource) {
    if (!validator.isURL(resource.origin)) {
      logger.error('Unable to download %s. Bad URL.', resource.origin)
      return Promise.resolve('Bad URL: ' + resource.origin)
    }
    logger.debug('Downloading %s to container %s...', resource.origin, container)

    const tryDownload = function () {
      return storage.store(container, resource.key, request(resource.origin), {'Content-Type': resource.type})
    }

    const hostname = url.parse(resource.origin).hostname
    return nodefn.call(dns.resolve4, hostname)
    .then(tryDownload, function (/* e */) {
      logger.error('Unable to download %s. Host cannot be resolved: %s', resource.origin, hostname)
      return Promise.reject('Host cannot be resolved: %s', hostname)
    })
  }

  logger.debug('Downloading resources to %s...', container)
  const tasks = []
  resources.forEach(function (resource) {
    tasks.push(function () { return down(resource) })
  })
  return sequence(tasks)
}

/**
 * Default downloader.
 * @module default.downloader
 */
module.exports = download

