'use strict';

const AbstractMongodbDao = require('./abstract');

/**
 * Label ghost DAO.
 * @module label_ghost.dao
 */
class LabelGhostDao extends AbstractMongodbDao {
  constructor(client) {
    super(client, 'label-ghost');
  }
}

module.exports = LabelGhostDao;
