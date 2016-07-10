'use strict'

const crypto = require('crypto')
const hal = require('hal')
const globals = require('../helper').globals
const storage = require('../storage')
const documentDao = require('../dao').user

/**
 * Add Gravatar link.
 * @param {Object} user user DTO
 * @return {Promise} promise of the dto
 */
const decorateWithGravatarData = function (user) {
  const hash = crypto.createHash('md5').update(user.uid).digest('hex')
  user.gravatar = 'http://www.gravatar.com/avatar/' + hash
  return Promise.resolve(user)
}

/**
 * Add user statistics.
 * @param {Object} user user DTO
 * @return {Promise} promise of the dto
 */
const decorateWithStatsData = function (user) {
  return documentDao.count({owner: user.id})
  .then((count) => {
    user.documents = count
    return storage.usage(user.id)
  })
  .then((usage) => {
    user.storage = usage
    return Promise.resolve(user)
  })
}

/**
 * Add HAL data into the document.
 * @param {Object} user user DTO
 * @return {Function} the decorator function
 */
const decorateWithHalData = function (url) {
  return function (user) {
    const resource = new hal.Resource(user, globals.BASE_URL + url + '/' + user.uid)
    return Promise.resolve(resource)
  }
}

module.exports = {
  /**
   * Decorate user DTO with statistics.
   * @return {Function} decorator function
   */
  stats: function () {
    return decorateWithStatsData
  },

  /**
   * Decorate user DTO with Gravatar URL.
   * @return {Function} decorator function
   */
  gravatar: function () {
    return decorateWithGravatarData
  },

  /**
   * Decorate user DTO with HAL data.
   * @param {String} url Path URL
   * @return {Function} decorator function
   */
  hal: function (url) {
    return decorateWithHalData(url)
  }
}
