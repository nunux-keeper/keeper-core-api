'use strict'

const controller = require('../controller')

/**
 * Profile API.
 */
module.exports = function (router) {
  /**
   * @swagger
   * /v2/profiles/current:
   *   get:
   *     summary: Get current profile informations
   *     tags:
   *       - Profile
   *     parameters:
   *       - name: withStats
   *         description: Add profile statistics
   *         in: query
   *         required: false
   *         type: boolean
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/Profile"
   *     security:
   *       - authenticated:
   *         - user
   */
  router.get('/profiles/current', controller.profile.get)

  /**
   * @swagger
   * /v2/profiles/current:
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
  router.put('/profiles/current', controller.profile.update)
}
