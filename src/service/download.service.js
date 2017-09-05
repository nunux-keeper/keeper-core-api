'use strict'

const logger = require('../helper').logger
const nodefn = require('when/node/function')
const sequence = require('when/sequence')
const dns = require('dns')
const url = require('url')
const validator = require('validator')
const storage = require('../storage')
const request = require('../helper').request
const jobService = require('./job.service')

const DOWNLOADER = process.env.APP_DOWNLOADER || 'default'

class DownloadService {
  constructor () {
    if (DOWNLOADER === 'async') {
      logger.debug('Using asynchronous downloader')
      this.download = this.asyncDownload.bind(this)
    } else {
      logger.debug('Using synchronous downloader')
      this.download = this.promiseDownload.bind(this)
    }
  }

  /**
   * Download resources using async job.
   * @param {Array} resources Array of Resource
   * @param {String} container Destination container
   * @returns {Promise} Promise of download task
   */
  asyncDownload (resources, container) {
    return jobService.launch(
      'download',
      {resources, container},
      jobService.priority.LOW,
      true
    )
  }

  /**
   * Download resources.
   * @param {Array} resources Array of Resource
   * @param {String} container Destination container
   * @returns {Promise} Promise of download
   */
  promiseDownload (resources, container) {
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
          return Promise.reject(`Host cannot be resolved: ${hostname}`)
        })
    }

    logger.debug('Downloading resources to %s...', container)
    const tasks = []
    resources.forEach(function (resource) {
      tasks.push(function () { return down(resource) })
    })
    return sequence(tasks)
  }
}

module.exports = new DownloadService()

