'use strict'

const AbstractMongodbDao = require('./abstract')

/**
 * Document graveyard DAO.
 * @module document_graveyard.dao
 */
class DocumentGraveyardDao extends AbstractMongodbDao {
  constructor (client, index) {
    super(client, index, 'document_graveyard')
  }

  getMapping () {
    return {
      properties: {
        title      : {type: 'string', store: 'yes'},
        content    : {type: 'string', store: 'yes'},
        contentType: {type: 'string', store: 'yes', index: 'not_analyzed'},
        owner      : {type: 'string', store: 'yes', index: 'not_analyzed'},
        labels     : {type: 'string', store: 'yes', index: 'not_analyzed'},
        attachments: {type: 'object'},
        origin     : {type: 'string', store: 'yes'},
        date       : {type: 'date', store: 'yes', format: 'dateOptionalTime'}
      }
    }
  }
}

module.exports = DocumentGraveyardDao
