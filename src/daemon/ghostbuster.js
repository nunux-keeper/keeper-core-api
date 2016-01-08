#!/usr/bin/env node

'use strict';

const program      = require('commander'),
      appInfo      = require('../../package.json'),
      logger       = require('../helper').logger,
      storage      = require('../storage'),
      AbstractDaemon = require('./abstract'),
      documentGraveyardDao = require('../dao').document_graveyard;

/**
 * Ghostbuster daemon.
 * Remove ghost documents from the graveyard.
 * @module resource_downloader
 */
class GhostbusterDaemon extends AbstractDaemon {
  constructor() {
    super('keeper-ghostbuster', module.parent === null);
    this.pending = true;
    this.limit = 100;
    this.wait = 60;
    this.hours = 2;
  }

  getExpirationDate() {
    const date = new Date();
    date.setTime(date.getTime() - (this.hours*60*60*1000));
    this.expirationDate = date;
  }

  getTimeToSleep() {
    return this.pending ? false : this.wait;
  }

  /**
   * Remove ghost documents from the graveyard.
   * @return {Promise} The promise of the deletion.
   */
  process() {
    return documentGraveyardDao.find({
      date: {$lte: this.getExpirationDate()}
    }, {limit: this.limit}).then((ghosts) => {
      this.pending = ghosts.length >= this.limit;
      if (!ghosts.length) {
        return Promise.resolve();
      }
      logger.debug('Deleting %d ghost(s)...', ghosts.length);
      const tasks = [];
      ghosts.forEach((ghost) => {
        const container = storage.getContainerName(ghost.owner, 'documents', ghost.id);
        const deleted = storage.remove(container);
        deleted.then(() => documentGraveyardDao.remove(ghost));
        tasks.push(deleted);
      });
      return Promise.all(tasks);
    });
  }
}

const daemon = new GhostbusterDaemon();

if (daemon.standalone) {
  // Create standalone daemon. Aka self executable.
  program.version(appInfo.version)
    .option('-v, --verbose', 'Verbose flag')
    .option('-d, --debug', 'Debug flag')
    .parse(process.argv);

  logger.level(program.debug ? 'debug' : program.verbose ? 'info' : 'error');

  // Start the daemon
  daemon.start();
} else {
  // Export daemon instance
  module.exports = daemon;
}

