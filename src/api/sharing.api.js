'use strict'

const controller = require('../controller')
const middleware = require('../middleware')

/**
 * Sharing API.
 */
module.exports = function (router) {
  /**
   * @swagger
   * /v2/sharing:
   *   get:
   *     summary: Get all user's sharing.
   *     tags:
   *       - Sharing
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           properties:
   *             sharing:
   *               type: array
   *               items:
   *                 $ref: "#/definitions/Sharing"
   *     security:
   *       - authenticated:
   *         - user
   */
  router.get('/sharing', controller.sharing.all)

  /**
   * @swagger
   * /v2/sharing/{sid}:
   *   get:
   *     summary: Get shared documents.
   *     tags:
   *       - Sharing
   *     parameters:
   *       - $ref: '#/parameters/sid'
   *       - $ref: '#/parameters/q'
   *       - $ref: '#/parameters/from'
   *       - $ref: '#/parameters/size'
   *       - $ref: '#/parameters/order'
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/SearchResult"
   */
  router.get('/sharing/:sid', middleware.sharing.get, controller.sharing.getDocuments)

  /**
   * @swagger
   * /v2/sharing/{sid}/{docid}:
   *   get:
   *     summary: Get shared document
   *     tags:
   *       - Sharing
   *     parameters:
   *       - $ref: '#/parameters/sid'
   *       - $ref: '#/parameters/docid'
   *     responses:
   *       202:
   *         description: Success
   *         schema:
   *           $ref: '#/definitions/Document'
   */
  router.get('/sharing/:sid/:docid', middleware.sharing.get, middleware.document, controller.sharing.getDocument)

  /**
   * @swagger
   * /v2/sharing/{sid}/{docid}/files/{key}:
   *   get:
   *     summary: Get shared document's files
   *     tags:
   *       - Sharing
   *       - Document
   *       - Attachment
   *     parameters:
   *       - $ref: '#/parameters/sid'
   *       - $ref: '#/parameters/docid'
   *       - $ref: '#/parameters/key'
   *       - $ref: '#/parameters/imageSize'
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           type: file
   */
  router.get('/sharing/:sid/:docid/files/:key', middleware.sharing.get, middleware.document, controller.attachment.get)
}
