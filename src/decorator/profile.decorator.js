'use strict'

const _ = require('lodash')
const hal = require('hal')
const hash = require('../helper/hash').hash
const globals = require('../helper').globals

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

/**
 * Add HAL data into the profile.
 * @param {String} url Path URL
 * @return {Function} the decorator function
 */
const decorateWithHalData = function (url) {
  return function (profile) {
    const resource = new hal.Resource(profile, globals.REALM + url)
    return Promise.resolve(resource)
  }
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
   * @param {String} url Path URL
   * @return {Function} decorator function
   */
  hal: function (url) {
    return decorateWithHalData(url)
  }
}
