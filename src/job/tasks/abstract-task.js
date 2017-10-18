'use strict'

const logger = require('../../helper').logger
const jobService = require('../../service').job
const metrics = require('../../metrics/client')

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
    const t0 = new Date()
    this.process(job, (err, result) => {
      const t1 = new Date()
      let sts = 'success'
      if (err) {
        sts = 'error'
        logger.error(`Error during ${this.name} job processing`, err)
      } else {
        logger.info(`${this.name} job done.`)
      }
      metrics.timing(`processed_job,name=${this.name},status=${sts}`, t1 - t0)
      done(err, result)
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
