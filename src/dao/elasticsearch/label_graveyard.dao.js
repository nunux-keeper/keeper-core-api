'use strict';

const AbstractMongodbDao = require('./abstract');

/**
 * Label graveyard DAO.
 * @module label_graveyard.dao
 */
class LabelGraveyardDao extends AbstractMongodbDao {
  constructor(client, index) {
    super(client, index, 'label_graveyard');
  }

  getMapping() {
    return {
      properties: {
        label: {type: 'string', store: 'yes', index: 'not_analyzed'},
        color: {type: 'string', store: 'yes', index: 'not_analyzed'},
        owner: {type: 'string', store: 'yes', index: 'not_analyzed'},
        date:  {type: 'date',   store: 'yes', format: 'dateOptionalTime'}
      }
    };
  }
}

module.exports = LabelGraveyardDao;

