'use strict'

const jwt = require('jsonwebtoken')
const globals = require('../../helper').globals
const validators = require('../../helper').validators

const loginMiddleware = function (req, res, next) {
  var token = jwt.sign({
    sub: req.user.id,
    name: req.user.username,
    admin: validators.isAdmin(req.user.id)
  }, globals.TOKEN_SECRET)
  res.append('X-Api-Token', token)
  res.render('auth_redirect.html', {token: token})
}

/**
 * Security application configuration.
 */
module.exports = function (app) {
  // Register providers
  require('./providers')(app, loginMiddleware)
}
