'use strict'

const _ = require('lodash')
const crypto = require('crypto')
const logger = require('../helper').logger
const globals = require('../helper').globals
const errors = require('../helper').errors
const validators = require('../helper').validators
const decorator = require('../decorator')
const eventHandler = require('../event')
const DecoratorStream = require('../decorator/decorator.stream')
const userDao = require('../dao').user

/**
 * User services.
 * @module user.service
 */
const UserService = {}

/**
 * Get user's details.
 * @param {String} uid User ID
 * @param {Function[]} decorators Decorators to apply
 * @return {Object} the user
 */
UserService.get = function (uid, decorators) {
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
 * Update user's data.
 * @param {String} user   User to update
 * @param {String} update Update data
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
    } else if (globals.AUTO_PROVISIONING_USERS || validators.isAdmin(user.uid)) {
      // Create the user.
      logger.debug('User %s authorized. Auto-provisioning...', user.uid)
      user.alias = crypto.createHash('md5').update(user.uid).digest('hex')
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
