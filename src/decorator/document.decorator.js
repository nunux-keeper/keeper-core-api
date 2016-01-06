'use strict';

const _ = require('lodash');

/**
 * Remove private data from document.
 * @param {Object} document Document DTO
 * @return {Promise} promise of the dto
 */
const decorateWithoutPrivateData = function(doc) {
  return Promise.resolve(_.omit(doc, 'owner'));
};

module.exports = {
  /**
   * Decorate document DTO by removing private datas.
   * @return {Function} decorator function
   */
  privacy: function() {
    return decorateWithoutPrivateData;
  }
};
