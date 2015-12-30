'use strict';

/**
 * Remove private data from document.
 * @param {Object} document Document DTO
 * @return {Promise} promise of the dto
 */
const decorateWithoutPrivateData = function(doc) {
  delete doc.owner;
  return Promise.resolve(doc);
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
