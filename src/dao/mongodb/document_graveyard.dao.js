'use strict';

const AbstractMongodbDao = require('./abstract');

/**
 * Document graveyard DAO.
 * @module document_graveyard.dao
 */
class DocumentGraveyardDao extends AbstractMongodbDao {
  constructor(client) {
    super(client, 'document_graveyard');
  }
}

module.exports = DocumentGraveyardDao;

