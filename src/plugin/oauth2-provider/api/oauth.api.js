'use strict'

const controller = require('../controller')
const clientDao = require('../dao').client

/**
 * Validating the client making the authorization request.
 * @param {String} clientId client ID
 * @param {String} redirectURI redirect URI to which the user will be
 * redirected after an authorization decision is obtained.
 * @param {Function} done callback with client instance and redirect URI
 */
const authorization = function (clientId, redirectURI, done) {
  clientDao.get(clientId).then(function (client) {
    // WARNING: For security purposes, it is highly advisable to check that
    //          redirectURI provided by the client matches one registered with
    //          the server.  For simplicity, this example does not.  You have
    //          been warned.
    return done(null, client, redirectURI)
  }, done)
}

/**
 * OAuth API Routes.
 */
module.exports = function (app, server, passport) {
  /**
   * @api {get} /oauth/authorize User authorization endpoint
   * @apiDescription Initializes a new authorization transaction. The application
   * authenticate the user and render a dialog to obtain their approval.
   * @apiVersion 0.0.1
   * @apiName GetAuthorize
   * @apiGroup oauth
   */
  app.get('/oauth/authorize',
          controller.ensureLoggedIn(app),
          server.authorization(authorization),
          controller.authorize(app))

  /**
   * User decision endpoint.
   *
   * `decision` middleware processes a user's decision to allow or deny access
   * requested by a client application.
   */
  app.post('/oauth/authorize/decision',
           controller.ensureAuthenticated,
           server.decision())

  /**
   * @api {post} /oauth/token Token endpoint
   * @apiDescription Handles client requests to exchange authorization grants
   * for access tokens.
   * @apiVersion 0.0.1
   * @apiName GetToken
   * @apiGroup oauth
   */
  app.post('/oauth/token',
           passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
           server.token(),
           server.errorHandler())
}
