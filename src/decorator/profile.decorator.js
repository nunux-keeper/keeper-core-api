'use strict'

const _ = require('lodash')
const hash = require('../helper/hash').hash

/**
 * Remove private data from profile.
 * @param {Object} profile Profile DTO
 * @return {Promise} promise of the dto
 */
const decorateWithoutPrivateData = function (profile) {
  return Promise.resolve(_.omit(profile, 'ip'))
}

/**
 * Remove private data from profile.
 * @param {Object} profile Profile DTO
 * @return {Promise} promise of the dto
 */
const decorateWithHash = function (profile) {
  profile.hash = hash(profile.uid)
  return Promise.resolve(profile)
}

module.exports = {
  /**
   * Decorate profile DTO by removing private datas.
   * @return {Function} decorator function
   */
  privacy: function () {
    return decorateWithoutPrivateData
  },
  /**
   * Decorate profile DTO by adding hash.
   * @return {Function} decorator function
   */
  hash: function () {
    return decorateWithHash
  }
}
