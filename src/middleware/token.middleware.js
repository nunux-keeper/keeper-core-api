'use strict'

const jwt = require('jsonwebtoken')
const errors = require('../helper').errors
const globals = require('../helper').globals
const validators = require('../helper').validators

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
    const token = req.get('X-Api-Token')
    if (!token) {
      return next(new errors.Unauthorized())
    }
    jwt.verify(token, key, {algorithm: algorithm}, function (err, decoded) {
      if (err) {
        return next(new errors.Unauthorized(err))
      }
      /*
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      userService.update({
        uid: decoded.uid,
        lastAccessDate: new Date(),
        lastAccessIp: ip
      });
      */
      req.user = {
        id: decoded.sub,
        admin: validators.isAdmin(decoded.sub)
      }
      next()
    })
  }
}
