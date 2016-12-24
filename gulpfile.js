'use strict'

const gulp = require('gulp')
const cucumber = require('gulp-cucumber')
const eslint = require('gulp-eslint')
const todo = require('gulp-todo')

// Task to lint the code.
gulp.task('lint', function () {
  return gulp.src('src/**/*.js')
  .pipe(eslint({useEslintrc: true}))
  .pipe(eslint.format())
  .pipe(eslint.failAfterError())
})

// Task to run tests
gulp.task('test', function (done) {
  const features = process.env.FEATURES || '*'
  gulp.src(`features/${features}.feature`)
  .pipe(cucumber({
    steps: 'features/step_definitions/*_step_definition.js',
    support: 'features/support/*.js'
  }))
  .once('error', function (err) {
    done(err)
    process.kill(process.pid, 'SIGINT')
  })
  .once('end', function () {
    done()
    process.kill(process.pid, 'SIGTERM')
  })
})

// Task to generate the TODO file
gulp.task('todo', function () {
  gulp.src(['src/**/*.js'])
  .pipe(todo())
  .pipe(gulp.dest('./'))
})

// Default task.
gulp.task('default', ['lint', 'todo'], function () {
  gulp.start('test')
})
