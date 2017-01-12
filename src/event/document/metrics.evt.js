'use strict'

const metrics = require('../../metrics/client')

/**
 * Document event handler.
 */
module.exports = function (documentEventHandler) {
  // Exit if disabled...
  if (metrics.disabled) {
    return
  }

  documentEventHandler.on('fetch', (evt) => {
    metrics.increment(`document.fetch,id=${evt.doc.id},owner=${evt.doc.owner},viewer=${evt.viewer}`)
  })

  documentEventHandler.on('create', (doc) => {
    metrics.increment(`document.create,owner=${doc.owner}`)
  })

  documentEventHandler.on('update', (doc) => {
    metrics.increment(`document.update,owner=${doc.owner}`)
  })

  documentEventHandler.on('remove', (doc) => {
    metrics.increment(`document.remove,owner=${doc.owner}`)
  })

  documentEventHandler.on('restore', (doc) => {
    metrics.increment(`document.restore,owner=${doc.owner}`)
  })

  documentEventHandler.on('destroy', (doc) => {
    metrics.increment(`document.destroy,owner=${doc.owner}`)
  })
}
