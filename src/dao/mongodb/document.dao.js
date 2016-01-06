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

  objectMapper(doc) {
    return doc ? {
      id:          doc._id ? doc._id.toString() : null,
      title:       doc.title,
      content:     doc.content,
      contentType: doc.contentType,
      date:        doc.date,
      origin:      doc.origin,
      labels:      doc.labels,
      attachments: doc.attachments,
      owner:       doc.owner
    } : null;
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

