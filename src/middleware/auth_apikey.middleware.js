'use strict'

const errors = require('../helper').errors
const logger = require('../helper').logger
const userService = require('../service').user

/**
 * Middleware to handle API key.
 */
module.exports = function (allowed) {
  return function (req, res, next) {
    // Ignore the middleware if already authenticated or bypassed
    if (req.user || req.authBypassed) {
      return next()
    }

    const authHeader = req.get('Authorization')
    if (authHeader && authHeader.startsWith('Basic ')) {
      // Extract credentials from the header
      const [login, apiKey] = Buffer.from(authHeader.substr(6), 'base64').toString('ascii').split(':')
      if (login !== 'api' || !apiKey) {
        return next(new errors.Unauthorized('Bad API key'))
      }
      // Only allow configured path and the method.
      if (!(allowed.path.find((p) => req.path.match(p)) &&
        allowed.method.find((m) => req.method === m))) {
        return next(new errors.Unauthorized('Path or method unauthorized'))
      }
      userService.loginWithApiKey(apiKey, {
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
      }).then((user) => {
        req.user = user
        next()
      }).catch((e) => {
        logger.error('Unable to login', e)
        return next(new errors.Unauthorized(e))
      })
    } else {
      return next()
    }
  }
}
