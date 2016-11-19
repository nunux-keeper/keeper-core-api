'use strict'

const _ = require('lodash')
const hal = require('hal')
const globals = require('../helper').globals

/**
 * Remove private data from document.
 * @param {Object} sharing Sharing DTO
 * @return {Promise} promise of the dto
 */
const decorateWithoutPrivateData = function (doc) {
  return Promise.resolve(_.omit(doc, 'owner'))
}

/**
 * Add HAL data into the document.
 * @param {Object} sharing Sharing DTO
 * @return {Promise} promise of the dto
 */
const decorateWithHalData = function (doc) {
  const resource = new hal.Resource(doc, `${globals.BASE_URL}/document/${doc.id}`)
  resource.link('search', globals.BASE_URL + '/document')
  resource.link('raw', `${globals.BASE_URL}/document/${doc.id}?raw`)
  return Promise.resolve(resource)
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
   * @return {Function} decorator function
   */
  hal: function () {
    return decorateWithHalData
  }
}
