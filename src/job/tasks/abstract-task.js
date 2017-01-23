'use strict'

const logger = require('../../helper').logger
const jobService = require('../../service').job

/**
 * Abstarct definition of a job task.
 */
class AbstractTask {
  constructor (jobName) {
    this.name = jobName
    jobService.queue.process(jobName, this.start.bind(this))
  }

  /**
   * Job launcher.
   * @param {Object} job to process
   * @param {Function} done Completion callback
   */
  start (job, done) {
    logger.info(`Starting ${this.name} ...`)
    this.process(job, (err) => {
      if (err) {
        logger.error(`Error during ${this.name} job processing`, err)
        done(err)
      } else {
        logger.info(`${this.name} job done.`)
        done()
      }
    })
  }

  /**
   * Task processing.
   * @param {Object} job to process
   * @return {Promise} job result
   */
  process (job) {
    return Promise.reject('Not implemented')
  }
}

module.exports = AbstractTask
