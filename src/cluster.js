#!/usr/bin/env node

'use strict'

/**
 * Keeper core API
 * Copyright (c) 2015 @ncarlier
 * All Rights Reserved.
 */

process.title = 'keeper-core-api'

const cluster = require('cluster')
const logger = require('./helper').logger
const globals = require('./helper').globals

if (globals.ENV === 'production' && cluster.isMaster) {
  const numWorkers = require('os').cpus().length

  logger.debug(`Master cluster setting up ${numWorkers}  workers...`)

  for (let i = 0; i < numWorkers; i++) {
    cluster.fork()
  }

  cluster.on('online', (worker) => {
    logger.debug(`Worker ${worker.process.pid} is online`)
  })

  cluster.on('exit', (worker, code, signal) => {
    logger.debug(`Worker ${worker.process.pid}' died with code: ${code}, and signal: ${signal}`)
    logger.debug('Starting a new worker')
    cluster.fork()
  })
} else {
  const app = require('./app')
  app.isReady().then(() => {
    app.listen(app.get('port'), function () {
      logger.info(
        '%s web server listening on port %s (%s mode)',
        globals.NAME,
        app.get('port'),
        globals.ENV
      )
    })
  })
}

