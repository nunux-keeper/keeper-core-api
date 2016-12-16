'use strict'

const hal = require('hal')
const urlConfig = require('../helper').urlConfig

/**
 * Add HAL data into the label.
 * @param {Object} label Label DTO
 * @return {Promise} promise of the dto
 */
const decorateWithHalData = function (label) {
  const resource = new hal.Resource(label, urlConfig.resolve(`/labels/${label.id}`))
  resource.link('all', urlConfig.resolve('/labels'))
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
