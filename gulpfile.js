'use strict'

const gulp = require('gulp')
const cucumber = require('gulp-cucumber')
const eslint = require('gulp-eslint')
const todo = require('gulp-todo')
const apidoc = require('gulp-api-doc')

// Task to lint the code.
gulp.task('lint', function () {
  return gulp.src('src/**/*.js')
  .pipe(eslint({useEslintrc: true}))
  .pipe(eslint.format())
  .pipe(eslint.failAfterError())
})

// Task to run tests
gulp.task('test', function () {
  // return gulp.src('features/admin.feature')
  return gulp.src('features/*.feature')
  .pipe(cucumber({
    steps: 'features/step_definitions/*_step_definition.js',
    support: 'features/support/*.js'
  }))
  .once('error', function () {
    process.kill(process.pid, 'SIGINT')
  })
  .once('end', function () {
    process.kill(process.pid, 'SIGTERM')
  })
})

// Task to generate the API documentation
gulp.task('doc', function () {
  return gulp.src('src/api')
  .pipe(apidoc())
  .pipe(gulp.dest('documentation'))
})

// Task to generate the TODO file
gulp.task('todo', function () {
  gulp.src(['src/**/*.js'])
  .pipe(todo())
  .pipe(gulp.dest('./'))
})

// Task to install the app (nothing more than generate the doc)
gulp.task('install', ['doc'])

// Default task.
gulp.task('default', ['lint', 'todo'], function () {
  gulp.start('test')
})
