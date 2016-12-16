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
   *       - Graveyard
   *     parameters:
   *       - $ref: '#/parameters/from'
   *       - $ref: '#/parameters/size'
   *       - $ref: '#/parameters/order'
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/SearchResult"
   *     security:
   *       - authenticated:
   *         - user
   */
  router.get('/graveyard/documents', middleware.graveyard.ghost, controller.document.search)

  /**
   * @swagger
   * /v2/graveyard/{docid}:
   *   delete:
   *     summary: Remove a document from the graveyard
   *     tags:
   *       - Graveyard
   *     parameters:
   *       - $ref: '#/parameters/docid'
   *     responses:
   *       204:
   *         description: Success
   *       default:
   *         description: Unexpected error
   *         schema:
   *           $ref: '#/definitions/Error'
   *     security:
   *       - authenticated:
   *         - user
   */
  router.delete('/graveyard/documents/:docid', controller.document.destroy)

  /**
   * @swagger
   * /v2/graveyard/{docid}:
   *   put:
   *     summary: Restore a deleted document
   *     tags:
   *       - Document
   *     parameters:
   *       - $ref: '#/parameters/docid'
   *     responses:
   *       200:
   *         description: Success
   *       default:
   *         description: Unexpected error
   *         schema:
   *           $ref: '#/definitions/Error'
   *     security:
   *       - authenticated:
   *         - user
   */
  router.put('/graveyard/documents/:docid', controller.document.restore)

  /**
   * @swagger
   * /v2/graveyard:
   *   delete:
   *     summary: Remove all documents from the graveyard
   *     tags:
   *       - Graveyard
   *     responses:
   *       204:
   *         description: Success
   *     security:
   *       - authenticated:
   *         - user
   */
  router.delete('/graveyard/documents', controller.document.emptyGraveyard)
}
