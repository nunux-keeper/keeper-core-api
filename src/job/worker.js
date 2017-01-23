#!/usr/bin/env node

'use strict'

const appInfo = require('../../package.json')
const program = require('commander')
const logger = require('../helper/logger')

process.title = 'keeper-job-worker'

program.version(appInfo.version)
.description('Job worker.')
.option('-v, --verbose', 'Verbose flag')
.option('-d, --debug', 'Debug flag')
.option('-j, --jobs <names>', 'Comma delimited list of job to handle')
.parse(process.argv)

// Set logger level
const defaultLevel = process.env.APP_LOG_LEVEL || 'error'
const level = program.debug ? 'debug' : program.verbose ? 'info' : defaultLevel
logger.level(level)

const jobs = program.jobs || process.env.APP_JOBS

const Tasks = require('./tasks')
const worker = new Tasks(jobs ? jobs.split(',') : [])

logger.info('Starting job worker...')
worker.start()

;['SIGINT', 'SIGTERM', 'SIGQUIT'].forEach((signal) => {
  process.on(signal, () => {
    worker.stop().then(() => {
      logger.info('Job worker stopped.')
      process.exit(0)
    }, (err) => {
      logger.error('Error during job shutdown.', err)
      process.exit(1)
    })
    setTimeout(function () {
      logger.error('Could not shutdown gracefully, forcefully shutting down!')
      process.exit(1)
    }, 10000)
  })
})

