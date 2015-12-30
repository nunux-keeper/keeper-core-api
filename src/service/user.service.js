'use strict';

const _       = require('lodash'),
      crypto  = require('crypto'),
      logger  = require('../helper').logger,
      userDao = require('../dao').user;

const autoGrantAccess = process.env.APP_AUTO_GRANT_ACCESS !== 'false';
const admins = process.env.APP_ADMIN ? process.env.APP_ADMIN.split(/[\s,]+/) : [];

/**
 * User services.
 * @module user.service
 */
const UserService = {};

/**
 * Update user's data.
 * @param {String} user   User to update
 * @param {String} update Update data
 * @return {Object} the updated user
 */
UserService.update = function(user, update) {
  return userDao.update(user, update)
    .then(function(u) {
      logger.info('User updated: %j', u);
      return Promise.resolve(u);
    });
};

/**
 * Login.
 * @param {String} user User to login
 * @return {Object} the logged user
 */
UserService.login = function(user) {
  const logged = userDao.get(user.uid).then(function(_user) {
    if (_user) {
      // Return the user.
      logger.debug('User %s authorized.', _user.uid);
      return Promise.resolve(_user);
    } else if (autoGrantAccess || _.contains(admins, user.uid)) {
      // Create the user.
      logger.info('User %s authorized. Will be created.', user.uid);
      user.publicAlias = crypto.createHash('md5').update(user.uid).digest('hex');
      return userDao.create(user);
    } else {
      // User not found and auto grant access is disabled.
      logger.warn('User %s not authorized.', user.uid);
      return Promise.reject('ENOTAUTHORIZED');
    }
  });

  return logged;
};


module.exports = UserService;
