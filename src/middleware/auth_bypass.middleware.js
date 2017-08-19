'use strict'

const logger = require('../helper').logger

/**
 * Authentification is bypassed for public URL.
 */
module.exports = function (exceptions) {
  return function (req, res, next) {
    req.authBypassed = false
    // Ignore other auth middlewares if the path and the method match an exception
    if (exceptions.path.find((p) => req.path.match(p)) &&
        exceptions.method.find((m) => req.method === m)) {
      logger.debug('%s:%s match the bypass. Other auth middlewares are ignored.', req.method, req.path)
      req.authBypassed = true
    }
    return next()
  }
}
