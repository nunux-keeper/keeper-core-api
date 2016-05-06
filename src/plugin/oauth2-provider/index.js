'use strict'

const oauth2orize = require('oauth2orize')
const uid = require('../helpers').uid
const userDao = require('./dao').user
const clientDao = require('./dao').client
const authzCodeDao = require('./dao').authzCode
const accessTokenDao = require('./dao').accessToken
const BasicStrategy = require('passport-http').BasicStrategy
const BearerStrategy = require('passport-http-bearer').Strategy
const ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy

// create OAuth 2.0 server
const server = oauth2orize.createServer()

// Register serialialization and deserialization functions.
//
// When a client redirects a user to user authorization endpoint, an
// authorization transaction is initiated.  To complete the transaction, the
// user must authenticate and approve the authorization request.  Because this
// may involve multiple HTTP request/response exchanges, the transaction is
// stored in the session.
//
// An application must supply serialization functions, which determine how the
// client object is serialized into the session.  Typically this will be a
// simple matter of serializing the client's ID, and deserializing by finding
// the client by ID from the database.
server.serializeClient(function (client, done) {
  return done(null, client.id)
})

server.deserializeClient(function (id, done) {
  clientDao.get(id).then(function (client) {
    done(null, client)
  }, done)
})

// Register supported grant types.
//
// OAuth 2.0 specifies a framework that allows users to grant client
// applications limited access to their protected resources.  It does this
// through a process of the user granting access, and the client exchanging
// the grant for an access token.

// Grant authorization codes.  The callback takes the `client` requesting
// authorization, the `redirectURI` (which is used as a verifier in the
// subsequent exchange), the authenticated `user` granting access, and
// their response, which contains approved scope, duration, etc. as parsed by
// the application.  The application issues a code, which is bound to these
// values, and will be exchanged for an access token.
server.grant(oauth2orize.grant.code(function (client, redirectURI, user, ares, done) {
  const code = uid(16)
  authzCodeDao.create({
    code: code,
    clientId: client.id,
    redirectURI: redirectURI,
    userId: user.uid
  }).then(function () {
    done(null, code)
  }, done)
}))

// Exchange authorization codes for access tokens.  The callback accepts the
// `client`, which is exchanging `code` and any `redirectURI` from the
// authorization request for verification.  If these values are validated, the
// application issues an access token on behalf of the user who authorized the
// code.
server.exchange(oauth2orize.exchange.code(function (client, code, redirectURI, done) {
  let authzCode = null
  // Find authorization code...
  authzCodeDao.get({code: code})
  .then(function (authzCode) {
    if (!authzCode ||
        client.id !== authzCode.clientId ||
        redirectURI !== authzCode.redirectURI) {
      return Promise.reject('EBADCODE')
    }
    // Remove authorization code...
    return authzCodeDao.remove(authzCode)
  })
  .then(function () {
    // Remove existing access token for this client and this user...
    return accessTokenDao.remove({
      userId: authzCode.userId,
      clientId: authzCode.clientId
    })
  })
  .then(function () {
    const token = uid(64)
    // Create new access token...
    return accessTokenDao.create({
      userId: authzCode.userId,
      clientId: authzCode.clientId,
      token: token
    })
  })
  .then(function (accessToken) {
    done(null, accessToken.token)
  }, function (err) {
    return (err === 'EBADCODE') ? done(null, false) : done(err)
  })
}))

/**
 * OAuth2 application configuration.
 */
module.exports = function (app, passport) {
  /**
   * BasicStrategy & ClientPasswordStrategy
   *
   * These strategies are used to authenticate registered OAuth clients.  They are
   * employed to protect the `token` endpoint, which consumers use to obtain
   * access tokens.  The OAuth 2.0 specification suggests that clients use the
   * HTTP Basic scheme to authenticate.  Use of the client password strategy
   * allows clients to send the same credentials in the request body (as opposed
   * to the `Authorization` header).  While this approach is not recommended by
   * the specification, in practice it is quite common.
   */
  passport.use(new BasicStrategy(function (username, password, done) {
    clientDao.get(username).then(function (client) {
      if (!client || client.secret !== password) {
        return done(null, false)
      }
      return done(null, client)
    }, done)
  }))

  passport.use(new ClientPasswordStrategy(function (clientId, clientSecret, done) {
    clientDao.get(clientId).then(function (client) {
      if (!client || client.secret !== clientSecret) {
        return done(null, false)
      }
      return done(null, client)
    }, done)
  }))

  /**
   * BearerStrategy
   *
   * This strategy is used to authenticate users based on an access token (aka a
   * bearer token).  The user must have previously authorized a client
   * application, which is issued an access token to make requests on behalf of
   * the authorizing user.
   */
  passport.use(new BearerStrategy(function (accessToken, done) {
    accessTokenDao.get({token: accessToken}).then(function (token) {
      if (!token) {
        return done(null, false)
      }

      userDao.get({uid: token.userId}).then(function (user) {
        if (!user) {
          return done(null, false)
        }
        // to keep this example simple, restricted scopes are not implemented,
        // and this is just for illustrative purposes
        var info = { scope: '*' }
        done(null, user, info)
      }, done)
    }, done)
  }))

  // Register API..
  require('./api')(app, server, passport)
}

