#!/usr/bin/env node

'use strict';

var STANDALONE = module.parent ? false : true;

if (STANDALONE) {
  process.title = 'keeper-resource-downloader';
}

const program      = require('commander'),
      EventEmitter = require('events').EventEmitter,
      appInfo      = require('../../package.json'),
      logger       = require('../helper').logger,
      download     = require('../downloader/default'),
      messaging    = require('../messaging');

/**
 * Process downloading.
 * @return {Promise} The promise of the download.
 */
const processDownload = function() {
  messaging.download.pull(5).then(function(data) {
    if (data === null) {
      return Promise.resolve();
    }
    download(data.resources, data.dest)
      .catch(function(err) {
         logger.error('Unable to download resources: %j', data, err);
         return Promise.reject(err);
      });
  });
};

/**
 * Resource downloader daemon.
 */
function ResourceDownloaderDaemon() {
  this.firstTick = true;
  this.listener = new EventEmitter();
  this.listener.on('next', function() {
    if (this.firstTick) {
      this.firstTick = false;
    } else {
      logger.debug('Next tick.');
    }
    processDownload()
    .catch(function(err) {
      logger.error('Error during downloading resources.', err);
      this.stop(1);
    }.bind(this))
    .done(function() {
      this.listener.emit('next');
    }.bind(this));
  }.bind(this));
}

/**
 * Start daemon.
 */
ResourceDownloaderDaemon.prototype.start = function() {
  logger.info('Starting resource downloader daemon...');
  this.listener.emit('next');
};

/**
 * Stop daemon.
 * @param {Integer} returnCode code to return
 */
ResourceDownloaderDaemon.prototype.stop = function(returnCode) {
  logger.info('Stopping resource downloader daemon...');
  if (this.sleeping) {
    clearTimeout(this.sleeping);
  }
  if (STANDALONE) {
    require('../dao').shutdown()
    .catch(function(err) {
      logger.error('Error during shutdown.', err);
      process.exit(1);
    })
    .done(function() {
      logger.info('Resource downloader daemon stopped.');
      process.exit(returnCode);
    });

    setTimeout(function() {
      logger.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  }
};

if (STANDALONE) {
  // Create standalone daemon. Aka self executable.
  program.version(appInfo.version)
  .option('-v, --verbose', 'Verbose flag')
  .option('-d, --debug', 'Debug flag')
  .parse(process.argv);

  logger.level(program.debug ? 'debug' : program.verbose ? 'info' : 'error');

  var app = new ResourceDownloaderDaemon();
  // Start the daemon
  app.start();

  // Graceful shutdown.
  ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach(function(signal) {
    process.on(signal, function() {
      app.stop((signal === 'SIGINT') ? 1 : 0);
    });
  });
}
else {
  // Export daemon instance
  module.exports = new ResourceDownloaderDaemon();
}


