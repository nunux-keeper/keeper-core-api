'use strict'

const request = require('request')

function clean (obj) {
  if (!obj) {
    return
  }
  for (const propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined) {
      delete obj[propName]
    }
  }
}

class OpenIDRegistrationClient {
  constructor (endpoint, token) {
    this.registrationEndpoint = endpoint
    this.initialAccessToken = token
  }

  errorHandler (err) {
    if (err.error_description) {
      err = err.error_description
    }
    return err
  }

  request (params) {
    const {method, token, json, uri} = params
    clean(json)
    const url = uri ? `${this.registrationEndpoint}/${uri}` : this.registrationEndpoint
    const headers = {}
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    return new Promise((resolve, reject) => {
      // console.log('OpenIDRegistrationClient::request >', {url, method, headers, json})
      request({url, method, headers, json}, (err, res, body) => {
        if (err || res.statusCode >= 400) {
          // console.log('OpenIDRegistrationClient::request *', err, body)
          return reject(this.errorHandler(err || body))
        }
        // console.log('OpenIDRegistrationClient::request <', params, body)
        return resolve(body)
      })
    })
  }

  register (metadata) {
    return this.request({
      method: 'POST',
      token: this.initialAccessToken,
      json: metadata
    })
  }

  get (clientId, registrationAccessToken) {
    return this.request({
      method: 'GET',
      uri: clientId,
      token: registrationAccessToken
    })
  }

  update (clientId, registrationAccessToken, metadata) {
    metadata.clientId = clientId
    return this.request({
      method: 'PUT',
      uri: clientId,
      token: registrationAccessToken,
      json: metadata
    })
  }

  remove (clientId, registrationAccessToken) {
    return this.request({
      method: 'DELETE',
      uri: clientId,
      token: registrationAccessToken
    })
  }

}

/**
 * OpenID registration client.
 * @module openid-registration-client
 */
module.exports = OpenIDRegistrationClient

