'use strict';

const errors = require('../../helper').errors,
      logger = require('../../helper').logger,
      validators = require('../../helper').validators,
      jwt        = require('jsonwebtoken');

const SECRET = process.env.APP_TOKEN_SECRET;

const loginMiddleware = function(req, res, next) {
  if (!validators.isAdmin(req.user.uid)) {
    logger.debug('Unauthorized user', req.user);
    return next(new errors.Unauthorized());
  }
  var token = jwt.sign({uid: req.user.uid}, SECRET);
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
