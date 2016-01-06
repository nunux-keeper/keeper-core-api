'use strict';

const AbstractMongodbDao = require('./abstract');

/**
 * Label DAO.
 * @module label.dao
 */
class LabelDao extends AbstractMongodbDao {
  constructor(client) {
    super(client, 'label');
  }

  objectMapper(doc) {
    return {
      id:    doc._id,
      label: doc.label,
      color: doc.color,
      owner: doc.owner,
      date:  doc.date
    };
  }
}

module.exports = LabelDao;
