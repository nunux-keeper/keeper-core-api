'use strict';

const url     = require('url'),
      path    = require('path'),
      elasticsearch = require('elasticsearch'),
      logger  = require('../../helper').logger,
      globals = require('../../helper').globals;


module.exports = function(uri) {
  const useAsMainDatabaseEngine = uri === globals.DATABASE_URI;
  const u = url.parse(uri), daos = {};
  const indexName = u.pathname.substring(1);
  const client = new elasticsearch.Client({
    host: u.host
  });

  daos.shutdown = function() {
    // NoOp shudown
    return Promise.resolve();
  };

  const configured = client.indices.exists({
    index: indexName
  }).then(function(exists) {
    if (!exists) {
      logger.debug('Creating index %s ...', indexName);
      return client.indices.create({
        index: indexName
      }).then(function(r) {
        logger.info('Index %s created:', indexName, r);
        return Promise.resolve(r);
      });
    } else {
      return Promise.resolve();
    }
  }).catch(function(err) {
    logger.error('Unable to create index index %s ...', indexName, err);
    return Promise.reject(err);
  });

  // Dynamic loading DAOs...
  require('fs').readdirSync(__dirname).forEach((file) => {
    if (/^[a-z_]+\.dao\.js$/.test(file)) {
      const name = path.basename(file, '.dao.js');
      if (!useAsMainDatabaseEngine && name !== 'document') {
        // Skip other DAO if not use as main database engine
        return;
      }
      logger.debug('Loading %s ElasticSearch DAO..', name);
      const Dao = require(path.join(__dirname, file));
      daos[name] = new Dao(client, indexName, useAsMainDatabaseEngine);
      configured.then(() => daos[name].configure());
    }
  });
  return daos;
};
