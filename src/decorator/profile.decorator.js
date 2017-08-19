'use strict'

const _ = require('lodash')
const hal = require('hal')
const hash = require('../helper/hash').hash
const urlConfig = require('../helper').urlConfig

/**
 * Remove private data from profile.
 * @param {Object} profile Profile DTO
 * @return {Promise} promise of the dto
 */
const decorateWithoutPrivateData = function (profile) {
  return Promise.resolve(_.omit(profile, ['ip', 'apiKey']))
}

/**
 * Hash email in order to get its gravatar.
 * @param {Object} profile Profile DTO
 * @return {Promise} promise of the dto
 */
const decorateWithHash = function (profile) {
  profile.hash = hash(profile.email || profile.uid)
  return Promise.resolve(profile)
}

/**
 * Add HAL data into the profile.
 * @param {Object} profile Profile DTO
 * @return {Promise} promise of the dto
 */
const decorateWithHalData = function (profile) {
  const resource = new hal.Resource(profile, urlConfig.resolve('/profiles/current'))
  return Promise.resolve(resource)
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
  },

  /**
   * Decorate profile DTO with HAL data.
   * @return {Function} decorator function
   */
  hal: function () {
    return decorateWithHalData
  }
}
