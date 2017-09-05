'use strict'

// Dynamic loading jobs...
const jobs = process.env.APP_JOBS

const Tasks = require('./tasks')
const worker = new Tasks(jobs ? jobs.split(',') : [])

module.exports = worker
