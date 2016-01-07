'use strict';

const AbstractMongodbDao = require('./abstract'),
      SearchEngine = require('../searchengine');

/**
 * Document DAO.
 * @module document.dao
 */
class DocumentDao extends AbstractMongodbDao {
  constructor(client) {
    super(client, 'document');
  }

  /**
   * Search documents.
   * @param {String} query Search query.
   * @return {Array} the documents
   */
  search(query) {
    // Delegate search to the searchengine.
    return SearchEngine.search(query);
  }
}

module.exports = DocumentDao;

