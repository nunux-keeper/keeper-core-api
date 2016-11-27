'use strict'

const hal = require('hal')
const globals = require('../helper').globals

/**
 * Add HAL data into the label.
 * @param {Object} label Label DTO
 * @return {Promise} promise of the dto
 */
const decorateWithHalData = function (label) {
  const resource = new hal.Resource(label, `${globals.BASE_URL}/label/${label.id}`)
  resource.link('all', `${globals.BASE_URL}/label`)
  return Promise.resolve(resource)
}

module.exports = {
  /**
   * Decorate label DTO with HAL data.
   * @return {Function} decorator function
   */
  hal: function () {
    return decorateWithHalData
  }
}
