'use strict';

const EventEmitter = require('events').EventEmitter,
      logger       = require('../../helper').logger;

class AbstractDaemon {
  constructor(name, standalone) {
    this.name = name;
    this.standalone = standalone;
    this.tickDate = null;
    this.sleeping = null;
    this.listener = new EventEmitter();
    this.listener.on('next', () => {
      this.sleeping = null;
      const timeToSleep = this.getTimeToSleep();
      if (timeToSleep) {
        logger.debug('%s daemon sleeping for %d seconds ...', this.name, timeToSleep);
        this.sleeping = setTimeout(() => {
          this.listener.emit('next');
        }, timeToSleep * 1000);
        return;
      }
      this.tickDate = Date.now();
      this.process()
        .then(() => this.listener.emit('next'))
        .catch((err) => {
          logger.error(`Error during ${this.name} daemon processing.`, err);
          this.stop(1);
        });
    });
    if (this.standalone) {
      process.title = this.name;
    }
  }

  /**
   * Daemon processing.
   * @return {Promise} processing result
   */
  process() {
    return Promise.reject('Daemon processing not implemented.');
  }

  /**
   * Get time to sleep.
   * To be overide if the deamon need to sleep between process.
   * @return {Integer} number of seconds to sleep
   */
  getTimeToSleep() {
    return false;
  }

  /**
   * Start daemon.
   */
  start() {
    if (!this.tickDate) {
      logger.info(`Starting ${this.name} daemon...`);
      if (this.standalone) {
        // Regiter graceful shutdown
        ['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
          process.on(signal, () => {
            this.stop((signal === 'SIGINT') ? 1 : 0);
          });
        });
      }
      this.listener.emit('next');
    }
  }

  /**
   * Stop daemon.
   * @param {Integer} returnCode code to return
   */
  stop(returnCode) {
    logger.info(`Stopping ${this.name} daemon...`);
    if (this.sleeping) {
      clearTimeout(this.sleeping);
    }
    if (this.standalone) {
      require('../../dao').shutdown().then(() => {
        logger.info(`${this.name} daemon stopped.`);
        process.exit(returnCode);
      }).catch(function(err) {
        logger.error('Error during shutdown.', err);
        process.exit(1);
      });
      setTimeout(function() {
        logger.error('Could not shutdown gracefully, forcefully shutting down!');
        process.exit(1);
      }, 10000);
    }
  }
}

module.exports = AbstractDaemon;
