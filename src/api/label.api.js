'use strict'

const controller = require('../controller')
const middleware = require('../middleware')

/**
 * Label API.
 */
module.exports = function (router) {
  /**
   * @swagger
   * /v2/label:
   *   get:
   *     summary: Get all user's labels
   *     tags:
   *       - Label
   *     parameters:
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           type: object
   *           properties:
   *             labels:
   *               type: array
   *               items:
   *                 $ref: "#/definitions/Label"
   *     security:
   *       - authenticated:
   *         - user
   */
  router.get('/label', controller.label.all)

  /**
   * @swagger
   * /v2/label/{labelId}:
   *   get:
   *     summary: Get label details
   *     tags:
   *       - Label
   *     parameters:
   *       - $ref: '#/parameters/labelId'
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/Label"
   *     security:
   *       - authenticated:
   *         - user
   */
  router.get('/label/:labelId', middleware.label, controller.label.get)

  /**
   * @swagger
   * /v2/label/{labelId}:
   *   put:
   *     summary: Update label details
   *     tags:
   *       - Label
   *     parameters:
   *       - $ref: '#/parameters/labelId'
   *       - name: body
   *         description: Label values to update
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/LabelPayload'
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/Label"
   *     security:
   *       - authenticated:
   *         - user
   */
  router.put('/label/:labelId', middleware.label, controller.label.update)

  /**
   * @swagger
   * /v2/label:
   *   post:
   *     summary: Update label details
   *     tags:
   *       - Label
   *     parameters:
   *       - $ref: '#/parameters/authorization'
   *       - name: body
   *         description: Label to create
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/LabelPayload'
   *     responses:
   *       201:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/Label"
   */
  router.post('/label', controller.label.create)

  /**
   * @swagger
   * /v2/label/{labelId}:
   *   delete:
   *     summary: Delete a label
   *     description: The label is not deleted but moved to the graveyard
   *     tags:
   *       - Label
   *     parameters:
   *       - $ref: '#/parameters/authorization'
   *       - $ref: '#/parameters/labelId'
   *     responses:
   *       204:
   *         description: Success
   */
  router.delete('/label/:labelId', middleware.label, controller.label.del)

  /**
   * @swagger
   * /v2/label/{labelId}/restore:
   *   post:
   *     summary: Restore a deleted label
   *     tags:
   *       - Label
   *     parameters:
   *       - $ref: '#/parameters/authorization'
   *       - $ref: '#/parameters/labelId'
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/Label"
   */
  router.post('/label/:labelId/restore', controller.label.restore)
}
