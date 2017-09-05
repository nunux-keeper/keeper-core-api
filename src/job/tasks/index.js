'use strict'

const path = require('path')
const logger = require('../../helper').logger
const globals = require('../../helper').globals
const services = require('../../service')

class TaskWorker {
  constructor (jobs = []) {
    this.names = new Set(jobs)
    this.loaded = this.init()
  }

  init () {
    return globals.EMBEDDED_WORKER
      ? Promise.resolve()
      : services.isReady()
  }

  stop () {
    return globals.EMBEDDED_WORKER
      ? Promise.resolve()
      : services.shutdown()
  }

  start () {
    this.loaded
      .then(() => {
        this.tasks = require('fs').readdirSync(__dirname).reduce((acc, file) => {
          if (/^[a-z_-]+\.task\.js$/.test(file)) {
            const name = path.basename(file, '.task.js')
            if (this.names.size === 0 || this.names.has(name)) {
              logger.debug('Loading %s task...', name)
              const Task = require(path.join(__dirname, file))
              acc.push(new Task(name))
            }
          }
          return acc
        }, [])
        logger.info('Ready to process tasks.')
      })
  }
}

module.exports = TaskWorker
