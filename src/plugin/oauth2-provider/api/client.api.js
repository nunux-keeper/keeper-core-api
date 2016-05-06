'use strict'

const controller = require('../controller')

/**
 * OAuth client API Routes.
 */
module.exports = function (router) {
  router.get('/user/:uid/client', controller.user.getClients)
  router.delete('/user/:uid/client/:cid', controller.user.revokeClient)
}
