'use strict';

const AbstractMongodbDao = require('./abstract');

/**
 * Document ghost DAO.
 * @module document_ghost.dao
 */
class DocumentGhostDao extends AbstractMongodbDao {
  constructor(client) {
    super(client, 'document_ghost');
  }
}

module.exports = DocumentGhostDao;

