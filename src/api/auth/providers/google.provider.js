'use strict';

const passport       = require('passport'),
      GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
      nodefn         = require('when/node/function'),
      logger         = require('../../../helper').logger;

/**
 * Google auth provider configuration.
 */
module.exports = function(app, loginMiddleware) {
  if (!process.env.APP_GOOGLE_KEY || !process.env.APP_GOOGLE_SECRET) {
    logger.error('APP_GOOGLE_KEY or APP_GOOGLE_SECRET not set. Google authentication cannot be configured!');
    return;
  }

  /**
   * Configure passport with Google strategy.
   */
  passport.use(new GoogleStrategy({
    clientID: process.env.APP_GOOGLE_KEY,
    clientSecret: process.env.APP_GOOGLE_SECRET,
    callbackURL: app.get('realm') + '/auth/google/callback',
  }, function(accessToken, refreshToken, profile, done) {
    const user = {
      id: profile.emails[0].value,
      username: profile.displayName
    };

    nodefn.bindCallback(user, done);
  }));

  /**
   * Google auth entry point.
   */
  app.get(
    '/auth/google',
    passport.authenticate('google', {session: false, scope: 'https://www.googleapis.com/auth/userinfo.email'})
  );

  /**
   * Google auth return URL.
   */
  app.get(
    '/auth/google/callback',
    passport.authenticate('google', {session: false, failureRedirect: '/'}),
    loginMiddleware
  );
};
