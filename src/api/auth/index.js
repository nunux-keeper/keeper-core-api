'use strict';

const jwt     = require('jsonwebtoken'),
      errors  = require('../../helper').errors,
      logger  = require('../../helper').logger,
      globals = require('../../helper').globals,
      validators = require('../../helper').validators;

const loginMiddleware = function(req, res, next) {
  if (!validators.isAdmin(req.user.id)) {
    logger.debug('Unauthorized user', req.user);
    return next(new errors.Unauthorized());
  }
  var token = jwt.sign({sub: req.user.id}, globals.TOKEN_SECRET);
  res.append('X-Api-Token', token);
  res.render('auth_redirect.html', {token: token});
};

/**
 * Security application configuration.
 */
module.exports = function(app) {
  // Register providers
  require('./providers')(app, loginMiddleware);
};
