'use strict'

const controller = require('../controller')

/**
 * Admin API.
 */
module.exports = function (router) {
  router.get('/admin/stats', controller.admin.getStatistics)
  router.get('/admin/user/:id', controller.admin.getUser)
  router.post('/admin/user/:id', controller.admin.createUser)
  router.delete('/admin/user/:id', controller.admin.deleteUser)
}
