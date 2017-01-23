
'use strict'

const logger = require('../helper').logger
const redis = require('../helper/redis')

const kue = require('kue')

class JobService {
  constructor () {
    this.priority = {
      HIGH: 'high',
      NORMAL: 'normal',
      LOW: 'low'
    }
    this.queue = kue.createQueue({
      redis: {
        createClientFactory: function () {
          return redis.createClient()
        }
      }
    })
  }

  shutdown () {
    return new Promise((resolve, reject) => {
      this.queue.shutdown(5000, (err) => {
        if (err) {
          return reject(err)
        }
        return resolve()
      })
    })
  }

  launch (name, params = {}, priority = 'normal') {
    logger.debug('Launching %s job with params', name, params)
    const job = this.queue
      .create(name, params)
      .priority(priority).save()
    logger.debug('Launched job:', job)
    return job
  }
}

module.exports = new JobService()
