
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

  launch (name, params = {}, priority = 'normal', removeOnComplete = false) {
    logger.debug('Launching %s job with params', name, params)
    return new Promise((resolve, reject) => {
      const job = this.queue
        .create(name, params)
        .priority(priority)
        .removeOnComplete(removeOnComplete)
        .save(err => err ? reject(err) : resolve(job))
    })
  }

  get (id) {
    return new Promise((resolve, reject) => {
      kue.Job.get(id, (err, job) => {
        if (err) {
          if (err.message && err.message.match(/^job "[\d]+" doesnt exist$/)) {
            return resolve(null)
          }
          return reject(err)
        }
        return resolve(job)
      })
    })
  }
}

module.exports = new JobService()
