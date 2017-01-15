'use strict'

const controller = require('../controller')
const middleware = require('../middleware')

/**
 * Admin API.
 */
module.exports = function (router) {
  /**
   * @swagger
   * /v2/admin/infos:
   *   get:
   *     summary: Get server informations and statistics
   *     tags:
   *       - Admin
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/AdminInfos"
   *     security:
   *       - authenticated:
   *         - user
   */
  router.get('/admin/infos', middleware.admin.isAdmin, controller.admin.getInfos)

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
  router.get('/admin/users/:uid', middleware.admin.isAdmin, controller.admin.getUser)

  /**
   * @swagger
   * /v2/admin/users/{uid}:
   *   delete:
   *     summary: Delete user account
   *     tags:
   *       - Admin
   *     parameters:
   *       - $ref: '#/parameters/uid'
   *     responses:
   *       205:
   *         description: Success
   *     security:
   *       - authenticated:
   *         - user
   */
  router.delete('/admin/users/:uid', middleware.admin.isAdmin, controller.admin.deleteUser)
}
