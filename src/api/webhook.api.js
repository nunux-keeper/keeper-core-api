'use strict'

const controller = require('../controller')
const middleware = require('../middleware')

/**
 * Webhook API.
 */
module.exports = function (router) {
  /**
   * @swagger
   * /v2/webhooks:
   *   get:
   *     summary: Search user's webhooks
   *     tags:
   *       - Webhook
   *     parameters:
   *       - $ref: '#/parameters/webhookLabel'
   *       - $ref: '#/parameters/webhookEvent'
   *       - $ref: '#/parameters/webhookActive'
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           type: object
   *           properties:
   *             webhooks:
   *               type: array
   *               items:
   *                 $ref: "#/definitions/Webhook"
   *     security:
   *       - authenticated:
   *         - user
   */
  router.get('/webhooks', controller.webhook.search)

  /**
   * @swagger
   * /v2/webhooks/{webhookId}:
   *   get:
   *     summary: Get webhook details
   *     tags:
   *       - Webhook
   *     parameters:
   *       - $ref: '#/parameters/webhookId'
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/Webhook"
   *     security:
   *       - authenticated:
   *         - user
   */
  router.get('/webhooks/:webhookId', middleware.webhook, controller.webhook.get)

  /**
   * @swagger
   * /v2/webhooks/{webhookId}:
   *   put:
   *     summary: Update webhook details
   *     tags:
   *       - Webhook
   *     parameters:
   *       - $ref: '#/parameters/webhookId'
   *       - name: body
   *         description: Webhook values to update
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/WebhookPayload'
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/Webhook"
   *     security:
   *       - authenticated:
   *         - user
   */
  router.put('/webhooks/:webhookId', middleware.webhook, controller.webhook.update)

  /**
   * @swagger
   * /v2/webhooks:
   *   post:
   *     summary: Create new webhook
   *     tags:
   *       - Webhook
   *     parameters:
   *       - name: body
   *         description: Webhook to create
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/WebhookPayload'
   *     responses:
   *       201:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/Webhook"
   *     security:
   *       - authenticated:
   *         - user
   */
  router.post('/webhooks', controller.webhook.create)

  /**
   * @swagger
   * /v2/webhooks/{webhookId}:
   *   delete:
   *     summary: Delete a webhook
   *     tags:
   *       - Webhook
   *     parameters:
   *       - $ref: '#/parameters/webhookId'
   *     responses:
   *       205:
   *         description: Success
   *     security:
   *       - authenticated:
   *         - user
   */
  router.delete('/webhooks/:webhookId', middleware.webhook, controller.webhook.del)
}
