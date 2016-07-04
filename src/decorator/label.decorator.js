'use strict'

const hal = require('hal')
const globals = require('../helper').globals

/**
 * Add HAL data into the label.
 * @param {String} url Path URL
 * @param {Boolean} extra add extra links
 * @return {Function} the decorator function
 */
const decorateWithHalData = function (url, extra) {
  return function (label) {
    const resource = new hal.Resource(label, globals.BASE_URL + url)
    if (extra) {
      resource.link('list', globals.BASE_URL + '/label')
    }
    return Promise.resolve(resource)
  }
}

module.exports = {
  /**
   * Decorate label DTO with HAL data.
   * @param {String} url Path URL
   * @param {Boolean} extra add extra links
   * @return {Function} decorator function
   */
  hal: function (url, extra) {
    return decorateWithHalData(url, extra)
  }
}
