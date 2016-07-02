'use strict'

const controller = require('../controller')

/**
 * Profile API.
 */
module.exports = function (router) {
  /**
   * @apiDefineSuccessStructure Profile
   * @apiSuccess {String}  uid              ID of the User (email).
   * @apiSuccess {String}  username         Name of the User.
   * @apiSuccess {String}  publicAlias      Public alias of the User.
   * @apiSuccess {Date}    date             Date of the registration.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "uid": "jhon.doe@foo.bar",
   *       "username": "Jhon Doe",
   *       "publicAlias": "jdoe",
   *       "date": "1373964740026"
   *     }
   */

  /**
   * @api {get} /profile Request current profile information
   * @apiVersion 0.0.1
   * @apiName GetProfile
   * @apiGroup profile
   * @apiPermission user
   *
   * @apiSuccessStructure Profile
   */
  router.get('/profile', controller.profile.get)

  /**
   * @api {put} /profile Update current profile information
   * @apiVersion 0.0.1
   * @apiName UpdateProfile
   * @apiGroup profile
   * @apiPermission user
   *
   * @apiParam {String}  publicAlias Public alias of the profile.
   *
   * @apiSuccessStructure Profile
   */
  router.put('/profile', controller.profile.update)
}
