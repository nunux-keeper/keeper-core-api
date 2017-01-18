'use strict'

const controller = require('../controller')
const middleware = require('../middleware')

/**
 * Public API.
 */
module.exports = function (router) {
  /**
   * @swagger
   * /v2/public/{sid}:
   *   get:
   *     summary: Get public documents.
   *     tags:
   *       - Sharing
   *     parameters:
   *       - $ref: '#/parameters/sid'
   *       - $ref: '#/parameters/q'
   *       - $ref: '#/parameters/from'
   *       - $ref: '#/parameters/size'
   *       - $ref: '#/parameters/order'
   *       - $ref: '#/parameters/output'
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           $ref: "#/definitions/SearchResult"
   */
  router.get('/public/:sid',
    middleware.sharing.get,
    middleware.sharing.assertPublic,
    controller.sharing.getDocuments)

  /**
   * @swagger
   * /v2/public/{sid}/{docid}:
   *   get:
   *     summary: Get public document
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
  router.get('/public/:sid/:docid',
    middleware.sharing.get,
    middleware.sharing.assertPublic,
    middleware.document,
    controller.sharing.getDocument)

  /**
   * @swagger
   * /v2/public/{sid}/{docid}/files/{key}:
   *   get:
   *     summary: Get public document's files
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
  router.get('/public/:sid/:docid/files/:key',
    middleware.sharing.get,
    middleware.sharing.assertPublic,
    middleware.document,
    controller.attachment.get)
}
