'use strict'

const request = require('request')
const logger = require('../../helper').logger

module.exports = function (uri) {
  logger.debug('Loading HTTP provider for event broker...')

  const client = {
    emit: function (topic, payload) {
      request({
        url: uri,
        method: 'POST',
        json: {topic, payload}
      }, function (err, res, body) {
        if (err || res.statusCode > 299) {
          logger.error('Unable to emit event to the HTTP broker', err || body)
        }
      })
    }
  }

  return client
}
