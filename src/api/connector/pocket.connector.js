'use strict';

const controller = require('../../controller');

/**
 * Pocket connector API.
 */
module.exports = function(router) {
  router.get('/user/:id/connect/pocket', controller.connector.pocket.connect);
  router.get('/user/:id/connect/pocket/callback', controller.connector.pocket.callback);
  router.get('/user/:id/disconnect/pocket', controller.connector.pocket.disconnect);
  router.get('/user/:id/pocket/import', controller.connector.pocket.importAll);
};
