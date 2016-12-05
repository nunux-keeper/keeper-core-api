'use strict'

const controller = require('../controller')

/**
 * Profile API.
 */
module.exports = function (router) {
  /**
   * @swagger
   * /v2/profile:
   *   get:
   *     summary: Get current profile informations
   *     tags:
   *       - Profile
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/Profile"
   *     security:
   *       - authenticated:
   *         - user
   */
  router.get('/profile', controller.profile.get)

  /**
   * @swagger
   * /v2/profile:
   *   put:
   *     summary: Update current profile informations
   *     tags:
   *       - Profile
   *     parameters:
   *       - name: body
   *         description: Profile values to update
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/ProfilePayload'
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/Profile"
   *     security:
   *       - authenticated:
   *         - user
   */
  router.put('/profile', controller.profile.update)
}
