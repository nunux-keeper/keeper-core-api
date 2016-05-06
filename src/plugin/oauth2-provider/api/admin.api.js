'use strict'

const controller = require('../controller')

/**
 * OAuth admin API Routes.
 */
module.exports = function (router) {
  // Client management API:
  router.get('/admin/oauth/client/:id', controller.client.get)
  router.get('/admin/oauth/client', controller.client.all)
  router.post('/admin/oauth/client', controller.client.create)
  router.put('/admin/oauth/client/:id', controller.client.update)
  router.delete('/admin/oauth/client/:id', controller.client.del)
}
