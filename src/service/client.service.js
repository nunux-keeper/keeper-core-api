'use strict'

const logger = require('../helper').logger
const errors = require('../helper').errors
const globals = require('../helper').globals
const OpenIDRegistrationClient = require('../helper').OpenIDRegistrationClient
const decorator = require('../decorator')
const clientDao = require('../dao').client

// OpenID connect registration client.
const oidcRegistrationClient = new OpenIDRegistrationClient(
  `${globals.AUTH_REALM}/clients-registrations/default`,
  globals.CLIENT_INITIAL_ACCESS_TOKEN
)

/**
 * OpenID Client app services.
 * @module client.service
 */
const ClientService = {}

/**
 * Get a Client.
 * @param {String} id ID of the client
 * @param {Function[]} decorators Decorators to apply
 * @return {Object} the client
 */
ClientService.get = function (id, decorators = []) {
  return clientDao.get(id)
  .then(c => {
    if (!c) {
      return Promise.reject(new errors.NotFound('Client not found: ' + id))
    }
    return decorator.decorate(c, ...decorators)
  })
}

/**
 * Gett all clients of an user.
 * @param {String} owner Owner of the clients
 * @param {Function[]} decorators Decorators to apply
 * @return {Array} the clients
 */
ClientService.all = function (owner, decorators = []) {
  return clientDao.find({owner}, {order: 'asc', from: 0, size: 256})
  .then(results => {
    if (results.length && decorators.length) {
      return Promise.all(results.map(c => decorator.decorate(c, ...decorators)))
    } else {
      return Promise.resolve(results)
    }
  })
}

/**
 * Create a client.
 * @param {String} owner Owner of the client
 * @param {Object} metadata client representationi format to create
 * @return {Object} the created client
 */
ClientService.create = function (owner, metadata) {
  const { redirectUris = [], webOrigins = ['+'], name } = metadata
  if (webOrigins.length === 0) {
    webOrigins.push('+')
  }
  logger.debug('Creating client for owner %s: %j ...', owner, metadata)
  return oidcRegistrationClient.register({redirectUris, webOrigins})
  .then(res => {
    const {clientId, secret, registrationAccessToken, redirectUris, webOrigins} = res
    logger.debug('OpenID client created for owner %s: %s', owner, clientId)
    return clientDao.create({
      owner,
      name,
      clientId,
      secret,
      redirectUris,
      webOrigins,
      registrationAccessToken,
      cdate: new Date(),
      mdate: new Date()
    }).then(c => {
      logger.info('Client created: %j', c)
      return Promise.resolve(c)
    })
  })
}

/**
 * Update a client.
 * @param {Object} client Client to update
 * @param {Object} update Update to apply
 * @return {Object} the updated client
 */
ClientService.update = function (client, update) {
  let {name = client.name, redirectUris, webOrigins} = update
  logger.debug('Updating client %s of owner %s: %j ...', client.clientId, client.owner, update)
  if (redirectUris || webOrigins) {
    return oidcRegistrationClient.update(client.clientId, client.registrationAccessToken, {redirectUris, webOrigins})
      .then(res => {
        const {clientId, registrationAccessToken} = res
        logger.debug('OpenID client updated for owner %s: %s', client.owner, clientId)
        return clientDao.update(client, {
          name,
          redirectUris: res.redirectUris,
          webOrigins: res.webOrigins,
          registrationAccessToken,
          mdate: new Date()
        }).then(c => {
          logger.info('Client updated: %j', c)
          return Promise.resolve(c)
        })
      })
  } else {
    return clientDao.update(client, {name, mdate: new Date()})
      .then(c => {
        logger.info('Client name updated: %j', c)
        return Promise.resolve(c)
      })
  }
}

/**
 * Remove a client.
 * @param {Object} client Client to delete
 * @return {Object} the deleted client (it's ghost)
 */
ClientService.remove = function (client) {
  logger.debug('Removing client %s of owner %s...', client.clientId, client.owner)
  return oidcRegistrationClient.remove(client.clientId, client.registrationAccessToken)
  .then(() => {
    logger.debug('OpenID client removed for owner %s: %s', client.owner, client.clientId)
    return clientDao.remove(client)
    .then(() => {
      logger.info('Client removed: %j', client)
      return Promise.resolve(client)
    })
  })
}

module.exports = ClientService
