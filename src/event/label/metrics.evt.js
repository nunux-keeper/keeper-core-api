'use strict'

const metrics = require('../../metrics/client')

/**
 * Label event handler.
 */
module.exports = function (labelEventHandler) {
  // Exit if disabled...
  if (metrics.disabled) {
    return
  }

  labelEventHandler.on('create', (label) => {
    metrics.increment(`label_event,action=create,owner=${label.owner}`)
  })

  labelEventHandler.on('update', (label) => {
    metrics.increment(`label_event,action=update,owner=${label.owner}`)
  })

  labelEventHandler.on('remove', (label) => {
    metrics.increment(`label_event,action=remove,owner=${label.owner}`)
  })

  labelEventHandler.on('restore', (label) => {
    metrics.increment(`label_event,action=restore,owner=${label.owner}`)
  })

  labelEventHandler.on('destroy', (label) => {
    metrics.increment(`label_event,action=destroy,owner=${label.owner}`)
  })
}
