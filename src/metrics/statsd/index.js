'use strict'

const url = require('url')
const Lynx = require('lynx')
const logger = require('../../helper').logger

module.exports = function (uri) {
  const u = url.parse(uri)
  logger.debug('Loading StatsD provider for metrics...')

  const client = new Lynx(u.hostname, u.port, {
    scope: 'keeper',
    on_error: logger.err
  })

  return client
}
