'use strict';

const path        = require('path'),
      MongoClient = require('mongodb').MongoClient,
      logger      = require('../../helper').logger;

module.exports = function(uri) {
  const client = MongoClient.connect(uri);
  const daos = {};
  daos.shutdown = function() {
    return client.then((db) => db.close());
  };

  // Dynamic loading DAOs...
  require('fs').readdirSync(__dirname).forEach((file) => {
    if (/^[a-z_]+\.dao\.js$/.test(file)) {
      const name = path.basename(file, '.dao.js');
      logger.debug('Loading %s MongoDB DAO..', name);
      const Dao = require(path.join(__dirname, file));
      daos[name] = new Dao(client);
    }
  });
  return daos;
};
