'use strict';

const AbstractMongodbDao = require('./abstract');

/**
 * Label ghost DAO.
 * @module label_ghost.dao
 */
class LabelGraveyardDao extends AbstractMongodbDao {
  constructor(client) {
    super(client, 'label_graveyard');
  }
}

module.exports = LabelGraveyardDao;
