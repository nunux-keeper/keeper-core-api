'use strict'

const jwt = require('jsonwebtoken')
const Cookies = require('cookies')
const errors = require('../helper').errors
const logger = require('../helper').logger
const globals = require('../helper').globals
const urlConfig = require('../helper').urlConfig
const userService = require('../service').user

let key = globals.TOKEN_SECRET
let algorithm = 'HS256'
if (globals.TOKEN_PUB_KEY) {
  const fs = require('fs')
  key = fs.readFileSync(globals.TOKEN_PUB_KEY)
  algorithm = 'RS256'
}

/**
 * Middleware to handle Token.
 */
module.exports = function (exceptions) {
  return function (req, res, next) {
    // Ignore the middleware if the path match an exception
    if (exceptions.find((exp) => req.path.match(exp))) {
      logger.debug('%s is public. So the token middleware is ignored.', req.path)
      return next()
    }

    let token = null
    let setCookie = false
    const cookies = new Cookies(req, res)
    const authHeader = req.get('Authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extract token from the header
      token = authHeader.substr(7)
      // Set access token cookie
      setCookie = true
    } else {
      // Try to extract token from cookie
      token = cookies.get('access_token')
    }
    if (!token) {
      return next(new errors.Unauthorized('Missing access token'))
    }
    jwt.verify(token, key, {algorithm: algorithm}, function (err, decoded) {
      if (err) {
        return next(new errors.Unauthorized(err))
      }
      userService.login({
        uid: decoded.preferred_username || decoded.sub,
        name: decoded.name,
        email: decoded.email,
        date: new Date(),
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
      }).then((user) => {
        req.user = user
        if (decoded.realm_access && decoded.realm_access.roles) {
          req.user.admin = decoded.realm_access.roles.indexOf('admin') > -1
        }
        if (setCookie) {
          cookies.set('access_token', token, {
            domain: urlConfig.hostname,
            path: urlConfig.basePath,
            httpOnly: true,
            secure: false // u.protocol === 'https:'
          })
        }
        next()
      }).catch((e) => {
        logger.error('Unable to login', e)
        return next(new errors.Unauthorized(e))
      })
    })
  }
}
