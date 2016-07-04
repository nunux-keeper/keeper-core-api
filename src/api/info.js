'use strict'

const express = require('express')
const controller = require('../controller')

/**
 * Info API.
 */
module.exports = function () {
  const router = express.Router()

  /**
   * @api {get} / Get API informations.
   * @apiVersion 2.0.0
   * @apiName GetInfos
   * @apiGroup api
   * @apiPermission none
   *
   * @apiSuccess {String} name        project name
   * @apiSuccess {String} description project description
   * @apiSuccess {String} version     project version
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *        "name": "keeper-core-api",
   *        "description": "Nunux Keeper core API",
   *        "version": "2.0"
   *     }
   */
  router.get('/', controller.monitoring.get)

  return router
}
