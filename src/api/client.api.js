'use strict'

const controller = require('../controller')
const middleware = require('../middleware')

/**
 * Client API.
 */
module.exports = function (router) {
  /**
   * @swagger
   * /v2/clients:
   *   get:
   *     summary: Get user's clients
   *     tags:
   *       - Client
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           type: object
   *           properties:
   *             clients:
   *               type: array
   *               items:
   *                 $ref: "#/definitions/Client"
   *     security:
   *       - authenticated:
   *         - user
   */
  router.get('/clients', controller.client.all)

  /**
   * @swagger
   * /v2/clients/{clientId}:
   *   get:
   *     summary: Get client details
   *     tags:
   *       - Client
   *     parameters:
   *       - $ref: '#/parameters/clientId'
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/Client"
   *     security:
   *       - authenticated:
   *         - user
   */
  router.get('/clients/:clientId', middleware.client, controller.client.get)

  /**
   * @swagger
   * /v2/clients/{clientId}:
   *   put:
   *     summary: Update client details
   *     tags:
   *       - Client
   *     parameters:
   *       - $ref: '#/parameters/clientId'
   *       - name: body
   *         description: Client values to update
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/ClientPayload'
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/Client"
   *     security:
   *       - authenticated:
   *         - user
   */
  router.put('/clients/:clientId', middleware.client, controller.client.update)

  /**
   * @swagger
   * /v2/clients:
   *   post:
   *     summary: Create new client
   *     tags:
   *       - Client
   *     parameters:
   *       - name: body
   *         description: Client to create
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/ClientPayload'
   *     responses:
   *       201:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/Client"
   *     security:
   *       - authenticated:
   *         - user
   */
  router.post('/clients', controller.client.create)

  /**
   * @swagger
   * /v2/clients/{clientId}:
   *   delete:
   *     summary: Delete a client
   *     tags:
   *       - Client
   *     parameters:
   *       - $ref: '#/parameters/clientId'
   *     responses:
   *       205:
   *         description: Success
   *     security:
   *       - authenticated:
   *         - user
   */
  router.delete('/clients/:clientId', middleware.client, controller.client.del)
}
