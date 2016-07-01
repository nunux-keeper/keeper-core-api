'use strict'

const jwt = require('jsonwebtoken')
const errors = require('../helper').errors
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
module.exports = function () {
  return function (req, res, next) {
    let token = req.get('Authorization')
    if (!token) {
      return next(new errors.Unauthorized())
    }
    if (token.startsWith('Bearer ')) {
      token = token.substr(7)
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
        next()
      }).catch((e) => {
        console.error('UNABLE TO LOGIN', e)
        return next(new errors.Unauthorized(e))
      })
    })
  }
}
