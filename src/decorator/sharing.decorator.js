'use strict'

const hal = require('hal')
const globals = require('../helper').globals

/**
 * Add HAL data into the sharing.
 * @param {Object} sharing Sharing DTO
 * @return {Promise} promise of the dto
 */
const decorateWithHalData = function (sharing) {
  const resource = new hal.Resource(sharing, `${globals.BASE_URL}/label/${sharing.targetLabel}/sharing`)
  resource.link('all', `${globals.BASE_URL}/sharing`)
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
