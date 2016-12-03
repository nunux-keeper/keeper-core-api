'use strict'

const controller = require('../controller')
const middleware = require('../middleware')

/**
 * Admin API.
 */
module.exports = function (router) {
  /**
   * @swagger
   * /v2/admin/user:
   *   get:
   *     summary: Get all users
   *     tags:
   *       - admin
   *     parameters:
   *       - $ref: '#/parameters/authorization'
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           type: object
   *           properties:
   *             users:
   *               type: array
   *               items:
   *                 $ref: "#/definitions/User"
   *     security:
   *       - authenticated:
   *         - admin
   */
  router.get('/admin/user', middleware.admin.isAdmin, controller.admin.getUsers)

  /**
   * @swagger
   * /v2/admin/user/{uid}:
   *   get:
   *     summary: Get all user's labels
   *     tags:
   *       - admin
   *     parameters:
   *       - $ref: '#/parameters/authorization'
   *       - $ref: '#/parameters/uid'
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/User"
   *       40x:
   *         description: Unexpected error
   *         schema:
   *           $ref: '#/definitions/Error'
   */
  router.get('/admin/user/:id', middleware.admin.isAdmin, controller.admin.getUser)
}
