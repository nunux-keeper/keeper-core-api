'use strict'

const controller = require('../controller')
const middleware = require('../middleware')

/**
 * Label sharing API.
 */
module.exports = function (router) {
  /**
   * @swagger
   * /v2/label/{labelId}/sharing:
   *   get:
   *     summary: Get sharing of a label
   *     tags:
   *       - Label
   *       - Sharing
   *     parameters:
   *       - $ref: '#/parameters/labelId'
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/Sharing"
   *     security:
   *       - authenticated:
   *         - user
   */
  router.get('/label/:labelId/sharing', middleware.label, middleware.sharing.getFromLabel, controller.sharing.get)

  /**
   * @swagger
   * /v2/label/{labelId}/sharing:
   *   put:
   *     summary: Update sharing of a label
   *     tags:
   *       - Label
   *       - Sharing
   *     parameters:
   *       - $ref: '#/parameters/labelId'
   *       - name: body
   *         description: Sharing values to update
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/SharingPayload'
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/Sharing"
   *     security:
   *       - authenticated:
   *         - user
   */
  router.put('/label/:labelId/sharing', middleware.label, middleware.sharing.getFromLabel, controller.sharing.update)

  /**
   * @swagger
   * /v2/label/{labelId}/sharing:
   *   post:
   *     summary: Create a sharing on a label
   *     tags:
   *       - Label
   *       - Sharing
   *     parameters:
   *       - $ref: '#/parameters/labelId'
   *       - name: body
   *         description: Sharing to create
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/SharingPayload'
   *     responses:
   *       201:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/Sharing"
   *     security:
   *       - authenticated:
   *         - user
   */
  router.post('/label/:labelId/sharing', middleware.label, controller.sharing.create)

  /**
   * @swagger
   * /v2/label/{labelId}/sharing:
   *   delete:
   *     summary: Delete sharing of a label
   *     tags:
   *       - Label
   *       - Sharing
   *     parameters:
   *       - $ref: '#/parameters/labelId'
   *     responses:
   *       204:
   *         description: Success
   *     security:
   *       - authenticated:
   *         - user
   */
  router.delete('/label/:labelId/sharing', middleware.label, middleware.sharing.getFromLabel, controller.sharing.del)
}
