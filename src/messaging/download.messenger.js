'use strict'

/**
 * Download messenger.
 */
function DownloadMessenger (client) {
  this.client = client
  this.topic = 'download'
}

/**
 * Push status into expiration queue.
 * @param {Object} status Status
 * @return {Promise} promise of the push
 */
DownloadMessenger.prototype.push = function (data) {
  return new Promise((resolve, reject) => {
    this.client.rpush(this.topic, JSON.stringify(data), (err) => {
      if (err) {
        return reject(err)
      }
      resolve(data)
    })
  })
}

/**
 * Pull status from expiration queue.
 * @param {Integer} timeout timeout in sec
 * @return {Promise} promise of the pull with status in param
 */
DownloadMessenger.prototype.pull = function (timeout) {
  return new Promise((resolve, reject) => {
    this.client.blpop(this.topic, timeout, (err, data) => {
      if (err) {
        return reject(err)
      }
      resolve(JSON.parse(data))
    })
  })
}

module.exports = DownloadMessenger

