'use strict'

const controller = require('../controller')
const middleware = require('../middleware')

/**
 * Document API.
 */
module.exports = function (router) {
  /**
   * @swagger
   * /v2/document:
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
  router.get('/document', controller.document.search)

  /**
   * @swagger
   * /v2/document/{docid}:
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
  router.get('/document/:docid', middleware.document, controller.document.get)

  /**
   * @swagger
   * /v2/document/{docid}:
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
  router.put('/document/:docid', middleware.document, controller.document.update)

  /**
   * @swagger
   * /v2/document:
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
   *       - name: files
   *         description: Attachment files
   *         in: formData
   *         required: false
   *         type: file
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
  router.post('/document', controller.document.create)

  /**
   * @swagger
   * /v2/document/{docid}:
   *   delete:
   *     summary: Delete a document
   *     description: The document is not deleted but moved to the graveyard
   *     tags:
   *       - Document
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
  router.delete('/document/:docid', middleware.document, controller.document.del)

  /**
   * @swagger
   * /v2/document/{docid}/restore:
   *   post:
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
  router.post('/document/:docid/restore', controller.document.restore)
}
