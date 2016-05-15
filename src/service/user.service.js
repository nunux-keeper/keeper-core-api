'use strict'

const _ = require('lodash')
const crypto = require('crypto')
const logger = require('../helper').logger
const globals = require('../helper').globals
const validators = require('../helper').validators
const userDao = require('../dao').user

/**
 * User services.
 * @module user.service
 */
const UserService = {}

/**
 * Update user's data.
 * @param {String} user   User to update
 * @param {String} update Update data
 * @return {Object} the updated user
 */
UserService.update = function (user, update) {
  update = _.pick(update, 'username')
  update.date = new Date()
  return userDao.update(user, update)
    .then(function (u) {
      logger.info('User updated: %j', u)
      return Promise.resolve(u)
    })
}

/**
 * Login.
 * @param {String} user User to login
 * @return {Object} the logged user
 */
UserService.login = function (user) {
  const logged = userDao.findByUid(user.uid).then(function (res) {
    const _user = res.length ? res[0] : null
    if (_user) {
      // Return the user.
      logger.debug('User %s authorized.', _user.uid)
      return Promise.resolve(_user)
    } else if (globals.AUTO_PROVISIONING_USERS || validators.isAdmin(user.uid)) {
      // Create the user.
      logger.info('User %s authorized. Auto-provisioning...', user.uid)
      user.publicAlias = crypto.createHash('md5').update(user.uid).digest('hex')
      return userDao.create(user)
    } else {
      // User not found and auto grant access is disabled.
      logger.warn('User %s not authorized.', user.uid)
      return Promise.reject('ENOTAUTHORIZED')
    }
  })

  return logged
}

module.exports = UserService
