'use strict';

const jwt     = require('jsonwebtoken'),
      errors  = require('../helper').errors,
      globals = require('../helper').globals,
      validators  = require('../helper').validators;

/**
 * Middleware to handle Token.
 */
module.exports = function() {
  return function(req, res, next) {
    const token  = req.get('X-Api-Token');
    if (!token) {
      return next(new errors.Unauthorized());
    }
    jwt.verify(token, globals.TOKEN_SECRET, function(err, decoded) {
      if (err) {
        return next(new errors.Unauthorized(err));
      }
      /*const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      userService.update({
        uid: decoded.uid,
        lastAccessDate: new Date(),
        lastAccessIp: ip
      });*/
      req.user = {
        id: decoded.sub,
        admin: validators.isAdmin(decoded.sub)
      };
      next();
    });
  };
};
