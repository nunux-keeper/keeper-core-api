'use strict'

const controller = require('../controller')
const middleware = require('../middleware')

/**
 * Label API.
 */
module.exports = function (router) {
  /**
   * @swagger
   * /v2/labels:
   *   get:
   *     summary: Get all user's labels
   *     tags:
   *       - Label
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
  router.get('/labels', controller.label.all)

  /**
   * @swagger
   * /v2/labels/{labelId}:
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
  router.get('/labels/:labelId', middleware.label, controller.label.get)

  /**
   * @swagger
   * /v2/labels/{labelId}:
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
  router.put('/labels/:labelId', middleware.label, controller.label.update)

  /**
   * @swagger
   * /v2/labels:
   *   post:
   *     summary: Create new label
   *     tags:
   *       - Label
   *     parameters:
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
   *     security:
   *       - authenticated:
   *         - user
   */
  router.post('/labels', controller.label.create)

  /**
   * @swagger
   * /v2/labels/{labelId}:
   *   delete:
   *     summary: Delete a label
   *     description: The label is not deleted but moved to the graveyard
   *     tags:
   *       - Label
   *     parameters:
   *       - $ref: '#/parameters/labelId'
   *     responses:
   *       205:
   *         description: Success
   *     security:
   *       - authenticated:
   *         - user
   */
  router.delete('/labels/:labelId', middleware.label, controller.label.del)

  /**
   * @swagger
   * /v2/graveyard/labels/{labelId}:
   *   put:
   *     summary: Restore a deleted label
   *     tags:
   *       - Graveyard
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
  router.put('/graveyard/labels/:labelId', controller.label.restore)
}
