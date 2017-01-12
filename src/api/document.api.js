'use strict'

const controller = require('../controller')
const middleware = require('../middleware')

/**
 * Document API.
 */
module.exports = function (router) {
  /**
   * @swagger
   * /v2/documents:
   *   get:
   *     summary: Search documents
   *     tags:
   *       - Document
   *     parameters:
   *       - $ref: '#/parameters/q'
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
  router.get('/documents', controller.document.search)

  /**
   * @swagger
   * /v2/documents/{docid}:
   *   get:
   *     summary: Get a document
   *     tags:
   *       - Document
   *     parameters:
   *       - $ref: '#/parameters/docid'
   *       - name: raw
   *         description: Get RAW document if set
   *         in: query
   *         required: false
   *         type: boolean
   *     responses:
   *       201:
   *         description: Success
   *         schema:
   *           $ref: '#/definitions/Document'
   *       default:
   *         description: Unexpected error
   *         schema:
   *           $ref: '#/definitions/Error'
   *     security:
   *       - authenticated:
   *         - user
   */
  router.get('/documents/:docid', middleware.document, controller.document.get)

  /**
   * @swagger
   * /v2/documents/{docid}:
   *   put:
   *     summary: Update a document
   *     tags:
   *       - Document
   *     parameters:
   *       - $ref: '#/parameters/docid'
   *       - name: body
   *         description: Document details to update
   *         in: body
   *         required: true
   *         schema:
   *           $ref: '#/definitions/DocumentPayload'
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           $ref: '#/definitions/Document'
   *       default:
   *         description: Unexpected error
   *         schema:
   *           $ref: '#/definitions/Error'
   *     security:
   *       - authenticated:
   *         - user
   */
  router.put('/documents/:docid', middleware.document, controller.document.update)

  /**
   * @swagger
   * /v2/documents:
   *   post:
   *     summary: Create a document
   *     tags:
   *       - Document
   *     parameters:
   *       - name: body
   *         description: Document to create
   *         in: body
   *         required: false
   *         schema:
   *           $ref: '#/definitions/DocumentPayload'
   *       - name: title
   *         description: Document title
   *         in: query
   *         required: false
   *         type: string
   *       - name: origin
   *         description: Document source URL
   *         in: query
   *         required: false
   *         type: string
   *     responses:
   *       201:
   *         description: Success
   *         schema:
   *           $ref: '#/definitions/Document'
   *       default:
   *         description: Unexpected error
   *         schema:
   *           $ref: '#/definitions/Error'
   *     security:
   *       - authenticated:
   *         - user
   */
  router.post('/documents', controller.document.create)

  /**
   * @swagger
   * /v2/documents/{docid}:
   *   delete:
   *     summary: Delete a document
   *     description: The document is not deleted but moved to the graveyard
   *     tags:
   *       - Document
   *     parameters:
   *       - $ref: '#/parameters/docid'
   *     responses:
   *       205:
   *         description: Success
   *       default:
   *         description: Unexpected error
   *         schema:
   *           $ref: '#/definitions/Error'
   *     security:
   *       - authenticated:
   *         - user
   */
  router.delete('/documents/:docid', middleware.document, controller.document.del)
}
