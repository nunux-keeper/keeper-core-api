'use strict'

const url = require('url')
const jwt = require('jsonwebtoken')
const Cookies = require('cookies')
const errors = require('../helper').errors
const logger = require('../helper').logger
const globals = require('../helper').globals
const validators = require('../helper').validators
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
module.exports = function (realm, exceptions) {
  return function (req, res, next) {
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
      // Ignore the middleware if the path match an exception
      if (exceptions.find((exp) => req.path.match(exp))) {
        logger.debug('No token and %s is public. So the token middleware is ignored.', req.path)
        return next()
      }
      return next(new errors.Unauthorized('Missing access token'))
    }
    jwt.verify(token, key, {algorithm: algorithm}, function (err, decoded) {
      if (err) {
        return next(new errors.Unauthorized(err))
      }
      userService.login({
        uid: decoded.email || decoded.sub,
        name: decoded.name,
        date: new Date(),
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
      }).then((user) => {
        req.user = user
        req.user.admin = validators.isAdmin(user.uid)
        if (setCookie) {
          const u = url.parse(realm)
          cookies.set('access_token', token, {
            domain: u.hostname,
            path: u.path,
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
