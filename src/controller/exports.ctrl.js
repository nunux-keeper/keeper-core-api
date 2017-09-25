'use strict'

const errors = require('../helper').errors
const storage = require('../storage')
const jobService = require('../service').job
const userService = require('../service').user

const EXPORTS = 'exports'

module.exports = {
  /**
   * Get export status.
   */
  getStatus: function (req, res /*, next */) {
    // Create Server Side Event response
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    })
    res.write('\n')

    if (req.user.exportRequest) {
      const jobId = req.user.exportRequest
      jobService.get(jobId).then((job) => {
        if (!job) {
          res.write('event: error\n')
          res.write('data: no export scheduled\n\n')
          return res.end()
        }
        let previousProgress = -1
        switch (job.state()) {
          case 'active':
          case 'inactive':
          case 'delayed':
            // Stream job progression...
            const terminate = function terminate () {
              // Remove event listeners
              jobService.queue.removeListener('job complete', completeHandler)
              jobService.queue.removeListener('job failed', failedHandler)
              jobService.queue.removeListener('job progress', progressHandler)
              res.end()
            }
            const completeHandler = function completeHandler (id, result) {
              if (id === jobId) {
                res.write('event: complete\n')
                res.write(`data: ${result.counter}\n\n`)
                terminate()
              }
            }
            const failedHandler = function failedHandler (id, err) {
              if (id === jobId) {
                const s = JSON.stringify(err)
                res.write('event: error\n')
                res.write(`data: ${s}\n\n`)
                terminate()
              }
            }
            const progressHandler = function progressHandler (id, progress, data) {
              // We only sent a progress event if the progress percentage has evolved
              if (id === jobId && progress !== previousProgress) {
                previousProgress = progress
                res.write('event: progress\n')
                res.write(`data: ${progress}|${data.completed}|${data.total}\n\n`)
                // support running within the compression middleware
                if (res.flush) {
                  res.flush()
                }
              }
            }

            // Jon events listeners...
            jobService.queue.on('job complete', completeHandler)
            jobService.queue.on('job failed', failedHandler)
            jobService.queue.on('job progress', progressHandler)
            break
          case 'failed':
            const s = JSON.stringify(job.error)
            res.write('event: error\n')
            res.write(`data: ${s}\n\n`)
            res.end()
            break
          case 'complete':
            res.write('event: complete\n')
            res.write(`data: ${job.result.counter}\n\n`)
            res.end()
            break
          default:
            res.write('event: error\n')
            res.write(`data: state not managed: ${job.state()}\n\n`)
            res.end()
        }
      }, err => {
        res.write('event: error\n')
        res.write(`data: ${err}\n\n`)
        res.end()
      })
    } else {
      res.write('event: error\n')
      res.write('data: no export scheduled\n\n')
      res.end()
    }
  },

  /**
   * Download export file.
   */
  download: function (req, res, next) {
    if (req.user.exportRequest) {
      jobService.get(req.user.exportRequest).then((job) => {
        if (!job) {
          return next(new errors.NotFound('No export scheduled.'))
        }
        if (job.state() === 'active' || job.state() === 'inactive' || job.state() === 'delayed') {
          return next(new errors.NotFound('Export file in progress.'))
        }
        const fileName = `${req.user.uid}.zip`
        storage.info(EXPORTS, fileName).then((infos) => {
          if (infos === null) {
            return next(new errors.NotFound(null, 'Export file not found'))
          }
          storage.stream(EXPORTS, fileName).then((s) => {
            // Send the attachment file content...
            res.append('Content-Length', infos.size)
            res.append('Content-Type', 'application/zip')
            res.append('Cache-Control', 'public, max-age=86400')
            res.append('Last-Modified', infos.mtime.toUTCString())
            s.pipe(res)
          }, next)
        }, next)
      }, next)
    } else {
      return next(new errors.NotFound('No export scheduled.'))
    }
  },

  /**
   * Schedule an exports of all documents.
   */
  schedule: function (req, res, next) {
    const exportUser = function () {
      return jobService.launch(
        'export-user',
        {uid: req.user.uid},
        jobService.priority.LOW,
        false
      ).then(job => {
        return userService.update(req.user, {exportRequest: job.id}).then((user) => {
          return Promise.resolve(job)
        })
      })
    }

    if (req.user.exportRequest) {
      jobService.get(req.user.exportRequest).then((job) => {
        if (job && (job.state() === 'active' || job.state() === 'inactive' || job.state() === 'delayed')) {
          return res.status(304).json()
        }
        exportUser().then(j => {
          return res.status(202).json({id: j.id})
        }, next)
      }, next)
    } else {
      exportUser().then(j => {
        return res.status(202).json({id: j.id})
      }, next)
    }
  }
}
