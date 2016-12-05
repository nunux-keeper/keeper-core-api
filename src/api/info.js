'use strict'

const express = require('express')
const controller = require('../controller')

/**
 * Info API.
 */
module.exports = function () {
  const router = express.Router()

  /**
   * @swagger
   * /:
   *   get:
   *     summary: Get API informations
   *     tags:
   *       - API informations
   *     responses:
   *       200:
   *         description: Success
   *         schema:
   *           $ref: '#/definitions/Info'
   */
  router.get('/', controller.info.get)

  return router
}
