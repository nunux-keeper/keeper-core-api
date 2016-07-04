'use strict'

const _ = require('lodash')
const hal = require('hal')
const globals = require('../helper').globals

/**
 * Remove private data from document.
 * @param {Object} document Document DTO
 * @return {Promise} promise of the dto
 */
const decorateWithoutPrivateData = function (doc) {
  return Promise.resolve(_.omit(doc, 'owner'))
}

/**
 * Add HAL data into the document.
 * @param {String} url Path URL
 * @param {Boolean} extra add extra links
 * @return {Function} the decorator function
 */
const decorateWithHalData = function (url, extra) {
  return function (doc) {
    const resource = new hal.Resource(doc, globals.REALM + url)
    if (extra) {
      resource.link('search', globals.REALM + '/v2/document')
      resource.link('raw', globals.REALM + url + '?raw')
    }
    return Promise.resolve(resource)
  }
}

module.exports = {
  /**
   * Decorate document DTO by removing private datas.
   * @return {Function} decorator function
   */
  privacy: function () {
    return decorateWithoutPrivateData
  },

  /**
   * Decorate document DTO with HAL data.
   * @param {String} url Path URL
   * @param {Boolean} extra add extra links
   * @return {Function} decorator function
   */
  hal: function (url, extra) {
    return decorateWithHalData(url, extra)
  }
}
