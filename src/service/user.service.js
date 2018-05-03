'use strict'

const _ = require('lodash')
const logger = require('../helper').logger
const globals = require('../helper').globals
const errors = require('../helper').errors
const hash = require('../helper/hash').hash
const decorator = require('../decorator')
const eventHandler = require('../event')
const DecoratorStream = require('../decorator/decorator.stream')
const userDao = require('../dao').user
const documentDao = require('../dao').document
const labelDao = require('../dao').label
const sharingDao = require('../dao').sharing
const webhookDao = require('../dao').webhook
const storage = require('../storage')

const objectIdRegExp = new RegExp('^[0-9a-fA-F]{24}$')

/**
 * User services.
 * @module user.service
 */
const UserService = {}

/**
 * Get user's details.
 * @param {String} id Internal ID or UID
 * @param {Function[]} decorators Decorators to apply
 * @return {Object} the user
 */
UserService.get = function (id, decorators = []) {
  const fetchUser = objectIdRegExp.test(id) ? userDao.get.bind(userDao) : userDao.findByUid.bind(userDao)
  return fetchUser(id).then(user => {
    if (!user) {
      return Promise.reject(new errors.NotFound('User not found: ' + id))
    }
    return decorator.decorate(user, ...decorators)
  })
}

/**
 * Get user's details.
 * @param {String} uid User ID
 * @param {Function[]} decorators Decorators to apply
 * @return {Object} the user
 * @deprecated get is able to retrieve an user by its UID or its internal ID
 */
UserService.getByUid = function (uid, decorators = []) {
  return userDao.findByUid(uid)
  .then(function (user) {
    if (!user) {
      return Promise.reject(new errors.NotFound('User not found: ' + uid))
    }
    return decorator.decorate(user, ...decorators)
  })
}

/**
 * Get all users (as a stream).
 * @param {Function[]} decorators Decorators to apply to each user
 * @return {Pomise} the promise of the stream
 */
UserService.stream = function (decorators) {
  return userDao.stream().then((s) => {
    const ds = new DecoratorStream(decorators)
    return Promise.resolve(s.pipe(ds))
  })
}

/**
 * Count users.
 * @return {Object} the number of users
 */
UserService.count = function () {
  return userDao.count()
}

/**
 * Update user's data.
 * @param {Object} user   User to update
 * @param {Object} update Update data
 * @return {Object} the updated user
 */
UserService.update = function (user, update) {
  update = _.pick(update, 'apiKey', 'exportRequest')
  if (update.apiKey) {
    update.apiKey = hash(update.apiKey)
  }
  return userDao.update(user, update)
    .then(function (u) {
      logger.info('User updated: %j', u)
      eventHandler.user.emit('update', u)
      return Promise.resolve(u)
    })
}

/**
 * Remove user account.
 * @param {String} id Internal ID or UID
 * @return {Object} the removed user
 */
UserService.remove = function (id) {
  if (!globals.ALLOW_REMOVE_USERS) {
    return Promise.reject('Remove an user is not allowed by the configuration.')
  }
  const fetchUser = objectIdRegExp.test(id) ? userDao.get.bind(userDao) : userDao.findByUid.bind(userDao)
  return fetchUser(id).then((user) => {
    if (!user.id) {
      return Promise.reject('Unable to remove user %j. ID not defined.')
    }
    logger.warn('Removing user: %j', user)
    const container = storage.getContainerName(user.id)
    return Promise.all([
      webhookDao.remove({owner: user.id}),
      sharingDao.remove({owner: user.id}),
      labelDao.remove({owner: user.id}),
      documentDao.remove({owner: user.id}),
      userDao.remove({id: user.id}),
      storage.remove(container)
    ])
    .then(() => {
      logger.info('User removed: %j', user)
      eventHandler.user.emit('remove', user)
      return Promise.resolve(user)
    }, (err) => {
      logger.error('Unable to remove user %j. Data may be inconsistent!', id)
      return Promise.reject(err)
    })
  })
}

/**
 * Login.
 * @param {Object} user User to login
 * @return {Object} the logged user
 */
UserService.login = function (user) {
  logger.debug('Login attempt: %s', user.uid)
  return userDao.findByUid(user.uid).then(function (_user) {
    if (_user) {
      // Return the user.
      logger.debug('User %s authorized.', _user.uid)
      if (_user.name !== user.name || _user.email !== user.email) {
        // Update user data if needed
        logger.debug('Updating user data: %s ...', user.uid, user)
        return userDao.update(_user, user)
          .then((_user) => {
            logger.info('User %s updated.', _user.uid)
            eventHandler.user.emit('update', _user)
            return Promise.resolve(_user)
          })
      }
      return Promise.resolve(_user)
    } else if (globals.ALLOW_AUTO_CREATE_USERS) {
      // Create the user.
      logger.debug('User %s authorized. Auto-provisioning...', user.uid)
      return userDao.create(user)
        .then((_user) => {
          logger.info('User %s created.', _user.uid)
          eventHandler.user.emit('create', _user)
          return Promise.resolve(_user)
        })
    } else {
      // User not found and auto grant access is disabled.
      logger.warn('User %s not authorized.', user.uid)
      eventHandler.user.emit('unauthorized', user)
      return Promise.reject(new errors.Unauthorized('Auto-provisioning disabled.'))
    }
  })
}

/**
 * Login with API key.
 * @param {String} key     API key
 * @param {String} options login options
 * @return {Object} the logged user
 */
UserService.loginWithApiKey = function (key, options) {
  logger.debug('Login attempt with API KEY: %s', options.ip)
  return userDao.findByApiKey(hash(key)).then(function (user) {
    if (user) {
      // Return the user.
      logger.debug('User %s authorized.', user.uid)
      return Promise.resolve(user)
    } else {
      // User not found and auto grant access is disabled.
      logger.warn('API key not found: %s', key)
      return Promise.reject(new errors.Unauthorized('Bad API key.'))
    }
  })
}

module.exports = UserService
