'use strict'

const bunyan = require('bunyan')

// Init. logger.
const logger = bunyan.createLogger({
  name: process.title,
  stream: process.stdout,
  level: process.env.APP_LOG_LEVEL || 'error'
})

/**
 * Logger helper.
 * @module logger
 */
module.exports = logger

