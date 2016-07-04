'use strict'

const controller = require('../controller')

/**
 * Profile API.
 */
module.exports = function (router) {
  /**
   * @apiDefineSuccessStructure Profile
   * @apiSuccess {String}  uid  ID of the User (email).
   * @apiSuccess {String}  name Name of the User.
   * @apiSuccess {Date}    date Date of the registration.
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *       "uid": "jhon.doe@foo.bar",
   *       "name": "Jhon Doe",
   *       "date": "1373964740026"
   *     }
   */

  /**
   * @api {get} /profile Get current profile informations.
   * @apiVersion 2.0.0
   * @apiName GetProfile
   * @apiGroup profile
   * @apiPermission user
   *
   * @apiSuccessStructure Profile
   */
  router.get('/profile', controller.profile.get)

  /**
   * @api {put} /profile Update current profile informations.
   * @apiVersion 2.0.0
   * @apiName UpdateProfile
   * @apiGroup profile
   * @apiPermission user
   *
   * @apiParam {String} alias Alias of the profile.
   *
   * @apiSuccessStructure Profile
   */
  router.put('/profile', controller.profile.update)
}
