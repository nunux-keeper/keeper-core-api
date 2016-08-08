'use strict'

const AbstractMongodbDao = require('./abstract')
const SearchEngine = require('../searchengine')

/**
 * Document DAO.
 * @module document.dao
 */
class DocumentDao extends AbstractMongodbDao {
  constructor (client) {
    super(client, 'document')
  }

  /**
   * Search documents.
   * @param {Object} query Search query.
   * @param {Object} params Search params.
   * @return {Array} the documents
   */
  search (query, params) {
    // Delegate search to the searchengine.
    return SearchEngine.search(query, params)
  }
}

module.exports = DocumentDao

