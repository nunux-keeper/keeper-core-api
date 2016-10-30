#!/usr/bin/env node

'use strict'

const program = require('commander')
const AbstractDaemon = require('./abstract')
const appInfo = require('../../package.json')
const logger = require('../helper').logger
const download = require('../downloader/default.downloader')
const messaging = require('../messaging')

/**
 * Resource downloader daemon.
 * @module downloader
 */
class ResourceDownloaderDaemon extends AbstractDaemon {
  constructor () {
    super('keeper-core-downloader', module.parent === null)
  }

  /**
   * Process downloading.
   * @return {Promise} The promise of the download.
   */
  process () {
    logger.debug('Pulling download request from messaging system...')
    return messaging.download.pull(5).then(function (data) {
      if (data === null) {
        return Promise.resolve()
      }
      return download(data.resources, data.dest)
        .catch(function (err) {
          logger.error('Unable to download resources: %j', data, err)
          return Promise.reject(err)
        })
    })
  }
}

const daemon = new ResourceDownloaderDaemon()

if (daemon.standalone) {
  // Create standalone daemon. Aka self executable.
  program.version(appInfo.version)
    .option('-v, --verbose', 'Verbose flag')
    .option('-d, --debug', 'Debug flag')
    .parse(process.argv)

  if (program.debug || program.verbose) {
    logger.level(program.debug ? 'debug' : 'info')
  }

  // Start the daemon
  daemon.start()
} else {
  // Export daemon instance
  module.exports = daemon
}

