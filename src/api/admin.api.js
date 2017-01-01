'use strict'

const controller = require('../controller')
const middleware = require('../middleware')

/**
 * Admin API.
 */
module.exports = function (router) {
  /**
   * @swagger
   * /v2/admin/users:
   *   get:
   *     summary: Get all users
   *     tags:
   *       - Admin
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           properties:
   *             users:
   *               type: array
   *               items:
   *                 $ref: "#/definitions/User"
   *     security:
   *       - authenticated:
   *         - user
   */
  router.get('/admin/users', middleware.admin.isAdmin, controller.admin.getUsers)

  /**
   * @swagger
   * /v2/admin/users/{uid}:
   *   get:
   *     summary: Get user details
   *     tags:
   *       - Admin
   *     parameters:
   *       - $ref: '#/parameters/uid'
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/User"
   *     security:
   *       - authenticated:
   *         - user
   */
  router.get('/admin/users/:id', middleware.admin.isAdmin, controller.admin.getUser)
}
