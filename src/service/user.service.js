'use strict'

const _ = require('lodash')
const logger = require('../helper').logger
const globals = require('../helper').globals
const errors = require('../helper').errors
const decorator = require('../decorator')
const eventHandler = require('../event')
const DecoratorStream = require('../decorator/decorator.stream')
const userDao = require('../dao').user
const documentDao = require('../dao').document
const labelDao = require('../dao').label
const sharingDao = require('../dao').sharing
const storage = require('../storage')

/**
 * User services.
 * @module user.service
 */
const UserService = {}

/**
 * Get user's details.
 * @param {String} id ID
 * @param {Function[]} decorators Decorators to apply
 * @return {Object} the user
 */
UserService.get = function (id, decorators = []) {
  return userDao.get(id)
  .then(function (user) {
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
  update = _.pick(update, 'name')
  update.date = new Date()
  return userDao.update(user, update)
    .then(function (u) {
      logger.info('User updated: %j', u)
      eventHandler.user.emit('update', u)
      return Promise.resolve(u)
    })
}

/**
 * Remove user account.
 * @param {String} uid User ID
 * @return {Object} the removed user
 */
UserService.remove = function (uid) {
  if (!globals.ALLOW_REMOVE_USERS) {
    return Promise.reject('Remove an user is not allowed by the configuration.')
  }
  return this.getByUid(uid)
  .then((user) => {
    if (!user.id) {
      return Promise.reject('Unable to remove user %j. ID not defined.')
    }
    logger.warn('Removing user: %j', user)
    const container = storage.getContainerName(user.id)
    return Promise.all([
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
      logger.error('Unable to remove user %j. Data may be inconsistent!')
      return Promise.reject(err)
    })
  })
}

/**
 * Login.
 * @param {String} user User to login
 * @return {Object} the logged user
 */
UserService.login = function (user) {
  logger.debug('Login attempt: %s', user.uid)
  return userDao.findByUid(user.uid).then(function (_user) {
    if (_user) {
      // Return the user.
      logger.debug('User %s authorized.', _user.uid)
      return Promise.resolve(_user)
    } else if (globals.ALLOW_AUTO_CREATE_USERS) {
      // Create the user.
      logger.debug('User %s authorized. Auto-provisioning...', user.uid)
      return userDao.create(user)
      .then((_user) => {
        logger.debug('User %s created.', _user.uid)
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

module.exports = UserService
