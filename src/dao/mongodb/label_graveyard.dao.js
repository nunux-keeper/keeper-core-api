'use strict';

const AbstractMongodbDao = require('./abstract');

/**
 * Label graveyard DAO.
 * @module label_graveyard.dao
 */
class LabelGraveyardDao extends AbstractMongodbDao {
  constructor(client) {
    super(client, 'label_graveyard');
  }
}

module.exports = LabelGraveyardDao;
