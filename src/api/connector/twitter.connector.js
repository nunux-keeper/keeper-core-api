'use strict';

const controller = require('../../controller');

/**
 * Twitter connector API.
 */
module.exports = function(router) {
  router.get('/user/:id/connect/twitter', controller.connector.twitter.connect);
  router.get('/user/:id/connect/twitter/callback', controller.connector.twitter.callback);
  router.get('/user/:id/disconnect/twitter', controller.connector.twitter.disconnect);
};
