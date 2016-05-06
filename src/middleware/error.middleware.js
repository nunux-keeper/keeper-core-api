'use strict'

const _ = require('lodash')
const logger = require('../helper').logger

/**
 * Middleware to handle errors.
 */
module.exports = function () {
  return function (err, req, res, next) {
    res.status(err.status || 500)
    if (res.statusCode >= 400 && res.statusCode !== 404) {
      logger.error(err)
    }
    const error = _.isString(err) ? err : (_.isObject(err) ? err.message : 'Unknown Error')
    res.json({
      error: error,
      meta: err.meta
    })
  }
}
