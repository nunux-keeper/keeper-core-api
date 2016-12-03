'use strict'

const url = require('url')

class UrlConfiguration {
  constructor () {
    this._port = process.env.APP_PORT || 3000
    this._apiVersion = 2
    this._baseUrl = process.env.APP_BASE_URL || `http://localhost:${this._port}`
    this._url = url.parse(this._baseUrl)
  }

  get apiVersion () {
    return `v${this._apiVersion}`
  }

  get port () {
    return this._port
  }

  get host () {
    return this._url.host
  }

  get hostname () {
    return this._url.hostname
  }

  get basePath () {
    return this._url.pathname
  }

  get basePathWithVersion () {
    return `${this._url.pathname}${this.apiVersion}`
  }

  get baseUrl () {
    return this._baseUrl
  }

  get baseUrlWithVersion () {
    return `${this.baseUrl}/${this.apiVersion}`
  }

  resolve (path, skipVersion) {
    return skipVersion ? `${this.baseUrl}${path}` : `${this.baseUrlWithVersion}${path}`
  }
}

module.exports = new UrlConfiguration()
