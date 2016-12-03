'use strict'

const controller = require('../controller')
const middleware = require('../middleware')

/**
 * Gravatar API.
 */
module.exports = function (router) {
  /**
   * @swagger
   * /v2/graveyard:
   *   get:
   *     summary: Search documents in the graveyard
   *     tags:
   *       - graveyard
   *     parameters:
   *       - $ref: '#/parameters/authorization'
   *       - $ref: '#/parameters/from'
   *       - $ref: '#/parameters/size'
   *       - $ref: '#/parameters/order'
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/SearchResult"
   */
  router.get('/graveyard', middleware.graveyard.ghost, controller.document.search)

  /**
   * @swagger
   * /v2/graveyard/{docid}:
   *   delete:
   *     summary: Remove a document from the graveyard
   *     tags:
   *       - graveyard
   *     parameters:
   *       - $ref: '#/parameters/authorization'
   *       - $ref: '#/parameters/docid'
   *     responses:
   *       204:
   *         description: Success
   *       default:
   *         description: Unexpected error
   *         schema:
   *           $ref: '#/definitions/Error'
   */
  router.delete('/graveyard/:docid', controller.document.destroy)

  /**
   * @swagger
   * /v2/graveyard:
   *   delete:
   *     summary: Remove all documents from the graveyard
   *     tags:
   *       - graveyard
   *     parameters:
   *       - $ref: '#/parameters/authorization'
   *     responses:
   *       204:
   *         description: Success
   */
  router.delete('/graveyard', controller.document.emptyGraveyard)
}
