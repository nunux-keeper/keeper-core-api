#!/usr/bin/env node

'use strict'

const appInfo = require('../../package.json')
const program = require('commander')
const logger = require('../helper/logger')
const assert = require('assert')

process.title = 'keeper-job-launcher'

function collectParams (val, params) {
  const [name, value] = val.split('=')
  params[name] = value
  return params
}

program.version(appInfo.version)
.description('Launch a job.')
.option('-v, --verbose', 'Verbose flag')
.option('-d, --debug', 'Debug flag')
.option('-j, --job <name>', 'Job name')
.option('-p, --param [name=value]', 'Job parameters', collectParams, {})
.parse(process.argv)

// Set logger level
const defaultLevel = process.env.APP_LOG_LEVEL || 'error'
const level = program.debug ? 'debug' : program.verbose ? 'info' : defaultLevel
logger.level(level)

assert(program.job, 'Job name parameter not defined')
assert(program.param, 'Job parameter not defined')

const jobService = require('../service/job.service')

const params = Object.assign({
  title: `${program.job} job started by the launcher`
}, program.param)

logger.debug('Queuing job %s with params %j', program.job, params)
jobService.launch(program.job, params, jobService.priority.HIGH)
  .then(job => {
    let progress = -1
    job.on('complete', function (result) {
      logger.info('Job %d completed with', job.id, result)
      process.exit(0)
    }).on('failed attempt', function (err, attempts) {
      logger.error('Job %d failed after %d attempts:', job.id, attempts, err)
      process.exit(1)
    }).on('failed', function (err) {
      logger.error('Job %d failed:', job.id, err)
      process.exit(1)
    }).on('progress', function (_progress) {
      if (progress !== _progress) {
        progress = _progress
        logger.debug('Job %d progression: %d%', job.id, progress)
      }
    })
  })

