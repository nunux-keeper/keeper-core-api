'use strict'

const _ = require('lodash')
const hal = require('hal')
const urlConfig = require('../helper').urlConfig

/**
 * Add HAL data into the client.
 * @param {Object} client Client DTO
 * @return {Promise} promise of the dto
 */
const decorateWithHalData = function (client) {
  const resource = new hal.Resource(client, urlConfig.resolve(`/clients/${client.id}`))
  resource.link('all', urlConfig.resolve('/clients'))
  return Promise.resolve(resource)
}

/**
 * Remove private data from client.
 * @param {Object} client Client DTO
 * @return {Promise} promise of the dto
 */
const decorateWithoutPrivateData = function (client) {
  return Promise.resolve(_.omit(client, 'registrationAccessToken'))
}

module.exports = {
  /**
   * Decorate client DTO by removing private datas.
   * @return {Function} decorator function
   */
  privacy: function () {
    return decorateWithoutPrivateData
  },

  /**
   * Decorate client DTO with HAL data.
   * @return {Function} decorator function
   */
  hal: function () {
    return decorateWithHalData
  }
}
