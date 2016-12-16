'use strict'

const hal = require('hal')
const urlConfig = require('../helper').urlConfig

/**
 * Add HAL data into the sharing.
 * @param {Object} sharing Sharing DTO
 * @return {Promise} promise of the dto
 */
const decorateWithHalData = function (sharing) {
  const resource = new hal.Resource(sharing, urlConfig.resolve(`/labels/${sharing.targetLabel}/sharing`))
  resource.link('all', urlConfig.resolve('/sharing'))
  return Promise.resolve(resource)
}

module.exports = {
  /**
   * Decorate sharing DTO with HAL data.
   * @return {Function} decorator function
   */
  hal: function () {
    return decorateWithHalData
  }
}
