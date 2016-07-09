'use strict'

const controller = require('../controller')
const middleware = require('../middleware')

/**
 * Admin API.
 */
module.exports = function (router) {
  router.get('/admin/user', middleware.admin.isAdmin, controller.admin.getUsers)
  router.get('/admin/user/:id', middleware.admin.isAdmin, controller.admin.getUser)
  router.post('/admin/user/:id', middleware.admin.isAdmin, controller.admin.createUser)
  router.delete('/admin/user/:id', middleware.admin.isAdmin, controller.admin.deleteUser)
}
